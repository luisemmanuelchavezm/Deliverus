import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import OrdersScreen from './OrdersScreen'
import OrderDetailScreen from './OrderDetailScreen'
import EditOrderScreen from './EditOrderScreen'
import RestaurantsCreen from '../restaurants/RestaurantsScreen'

const Stack = createNativeStackNavigator()

export default function OrdersStack () {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='OrdersScreen'
        component={OrdersScreen}
        options={{
          title: 'My Orders'
        }} />
      <Stack.Screen
        name='OrderDetailScreen'
        component={OrderDetailScreen}
        options={{
          title: 'Order Detail'
        }} />
        <Stack.Screen
        name='EditOrderScreen'
        component={EditOrderScreen}
        options={{
          title: 'Edit Order'
        }} />
        <Stack.Screen
        name='RestaurantsScreen'
        component={RestaurantsCreen}
        options={{
          title: 'Restaurant Screen'
        }} />
    </Stack.Navigator>
  )
}
