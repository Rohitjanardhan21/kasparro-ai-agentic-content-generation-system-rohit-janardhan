/**
 * Template definitions for different page types
 */

export const FAQ_PAGE_TEMPLATE = {
  page_info: {
    title: "{{product.name}} - Frequently Asked Questions",
    type: "faq",
    "$field:product.name": "product_name"
  },
  "$block:generateFaqBlock": {
    limit: 5,
    category: null
  },
  product_overview: {
    "$field:product.name": "name",
    "$field:product.concentration": "concentration",
    "$field:product.benefits": "key_benefits"
  },
  contact_info: {
    support_message: "For additional questions, please contact our support team",
    last_updated: "{{metadata.generated_at}}"
  }
};

export const PRODUCT_PAGE_TEMPLATE = {
  product_info: {
    "$field:product.name": "title",
    "$field:product.concentration": "concentration",
    description: "Premium skincare solution for {{product.skinType}} skin"
  },
  "$block:generateSpecsBlock": {},
  "$block:generateBenefitsBlock": {},
  "$block:extractUsageBlock": {},
  "$block:generateSafetyBlock": {},
  "$block:generatePricingBlock": {},
  metadata: {
    page_type: "product_description",
    generated_at: "{{metadata.generated_at}}"
  }
};

export const COMPARISON_PAGE_TEMPLATE = {
  comparison_info: {
    title: "Product Comparison: {{product.name}} vs {{comparison_product.name}}",
    type: "side_by_side_comparison"
  },
  product_a: {
    "$field:product.name": "name",
    "$field:product.concentration": "concentration",
    "$field:product.price": "price",
    "$field:product.keyIngredients": "ingredients",
    "$field:product.benefits": "benefits"
  },
  product_b: {
    "$field:comparison_product.name": "name",
    "$field:comparison_product.concentration": "concentration", 
    "$field:comparison_product.price": "price",
    "$field:comparison_product.keyIngredients": "ingredients",
    "$field:comparison_product.benefits": "benefits"
  },
  "$block:compareIngredientsBlock": {},
  analysis: {
    recommendation: "Choose based on your specific skin type and ingredient preferences",
    generated_at: "{{metadata.generated_at}}"
  }
};