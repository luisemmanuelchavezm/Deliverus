import { Restaurant, Order, Product } from '../../models/models.js'
import { check } from 'express-validator'
// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

const checkRestaurantExists = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req)
    if (!restaurant) {
      return false
    }
    return true
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const create = [
  check('restaurantId').exists().custom(checkRestaurantExists),
  check('products').exists().isArray().isLength({ min: 1 }).toArray(),
  check('products.*.productId').exists().isInt({ min: 1 }).toInt(),
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('products.*.quantity').exists().isInt({ min: 1 }).toInt(),
  check('products').custom(async (value, { req }) => {
    const restaurantId = req.body.restaurantId
    for (let i = 0; i < value.length; i++) {
      const product = await Product.findByPk(value[i].productId)
      if (product.restaurantId !== restaurantId) {
        throw new Error('restaurantId invalid')
      }
    }
    return true
  }),
  check('products').custom(async (value, { req }) => {
    for (let i = 0; i < value.length; i++) {
      const product = await Product.findByPk(value[i].productId)
      if (product.availability !== true) {
        throw new Error('producto no disponible')
      }
    }
  }
  )
]

// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.

const update = [
  check('restaurantId').not().exists(),
  check('products').exists().isArray().isLength({ min: 1 }).toArray(),
  check('products.*.productId').exists().isInt({ min: 1 }).toInt(),
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('products.*.quantity').exists().isInt({ min: 1 }).toInt(),
  check('products').custom(async (value, { req }) => {
    const orderId = req.params.orderId
    const orderDb = await Order.findByPk(orderId)
    if (!orderDb || !orderId) {
      throw new Error('invalid order')
    }
    const restaurantId = orderDb.restaurantId
    for (let i = 0; i < value.length; i++) {
      const product = await Product.findByPk(value[i].productId)
      if (product.restaurantId !== restaurantId) {
        throw new Error('invalid restaurantId')
      }
    }
    return true
  }),
  check('products').custom(async (value, { req }) => {
    for (let i = 0; i < value.length; i++) {
      const product = await Product.findByPk(value[i].productId)
      if (product.availability !== true) {
        throw new Error('producto no disponible')
      }
    }
  }
  ),
  check('products').custom(async (value, { req }) => {
    const order = await Order.findByPk(req.params.orderId)
    if (order.getStatus !== 'pending') {
      return false
    }
  })
]

export { create, update }
