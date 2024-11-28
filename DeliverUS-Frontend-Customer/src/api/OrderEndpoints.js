import { get, destroy, put, post } from './helpers/ApiRequestsHelper'

function createOrder (data) {
  return post('/orders/', data)
}
function getAllorders () {
  return get('/orders')
}
function getOrderDetail (id) {
  return get(`/orders/${id}`)
}
function removeOrder (id) {
  return destroy(`orders/${id}`)
}
function update (id, data) {
  return put(`orders/${id}`, data)
}

export { createOrder, getOrderDetail, getAllorders, removeOrder, update }
