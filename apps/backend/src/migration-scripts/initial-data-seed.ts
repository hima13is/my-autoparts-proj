import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import { DEFAULT_REGION_STORE_POLICIES } from "../lib/region-store-policies";

/**
 * Runs once, automatically, on the first `medusa db:migrate`.
 *
 * Sets up the bare minimum for an India-only store:
 * - INR store + "India" region + IN tax region
 * - default sales channel + publishable API key (used by the storefront)
 * - one stock location representing the drop-ship supplier network
 * - a placeholder "Standard Delivery" shipping option
 *
 * Products, vehicles and suppliers are seeded in Build Phase 2.
 * Real payment (Razorpay) and shipping (Shiprocket) providers arrive in Phase 3.
 */
export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Website",
          description: "Main storefront",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront publishable key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "FitGaadi",
          supported_currencies: [{ currency_code: "inr", is_default: true }],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const {
    result: [region],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: "inr",
          countries: ["in"],
          // Prices shown to shoppers include GST.
          automatic_taxes: true,
          is_tax_inclusive: true,
          payment_providers: ["pp_system_default"],
          metadata: DEFAULT_REGION_STORE_POLICIES,
        },
      ],
    },
  });

  logger.info("Seeding tax region...");
  await createTaxRegionsWorkflow(container).run({
    input: [{ country_code: "in", provider_id: "tp_system" }],
  });

  logger.info("Seeding stock location data...");
  const {
    result: [stockLocation],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Supplier network (drop-ship)",
          address: {
            city: "New Delhi",
            country_code: "IN",
            address_1: "",
          },
        },
      ],
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  logger.info("Seeding fulfillment data...");
  // The default shipping profile is created by a core migration script.
  const {
    data: [shippingProfile],
  } = await query.graph({ entity: "shipping_profile", fields: ["id"] });

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "India delivery",
    type: "shipping",
    service_zones: [
      {
        name: "India",
        geo_zones: [{ country_code: "in", type: "country" }],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Delivered in 3-7 days.",
          code: "standard",
        },
        // Placeholder until Shiprocket rates are wired in (Build Phase 3).
        prices: [
          { currency_code: "inr", amount: 0 },
          { region_id: region.id, amount: 0 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [defaultSalesChannel.id] },
  });

  logger.info("Finished seeding initial store data.");
}
