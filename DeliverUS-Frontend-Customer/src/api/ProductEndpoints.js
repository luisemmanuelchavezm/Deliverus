import { get } from './helpers/ApiRequestsHelper'

function getProductCategories () {
  return get('productCategories')
}

function getProductId (id) {
  return get(`products/${id}`)
}

function getProductsPopular () {
  return get('products/popular')
}

export { getProductCategories, getProductId, getProductsPopular }
