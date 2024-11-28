/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Text } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { getOrderDetail } from '../../api/OrderEndpoints'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import defaultProductImage from '../../../assets/product.jpeg'

export default function OrderDetailScreen ({ navigation, route }) {
  const [product, setProduct] = useState([])
  const [order, setOrder] = useState([])

  useEffect(() => {
    fetchProductDetail()
  }, [route])

  const fetchProductDetail = async () => {
    try {
      const fetchedOrder = await getOrderDetail(route.params.id)
      setOrder(fetchedOrder)
      const orderProducts = fetchedOrder.products
      setProduct(orderProducts)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving product details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextRegular>Price per unit: {item.price.toFixed(2)}€</TextRegular>
        <TextRegular>Quantity: {item.OrderProducts.quantity}</TextRegular>
        <TextRegular>Price: <TextSemiBold>{(item.OrderProducts.quantity * item.OrderProducts.unityPrice).toFixed(2)}€</TextSemiBold></TextRegular>
        <TextRegular>
        </TextRegular>
      </ImageCard>
    )
  }
  // hola

  return (
    <>
    <View style = {styles.containerInfo}>
      <Text style = {styles.orderInfo}> Delivering to {order.address} with a total price of <Text style = {{ color: 'red' }}>{order.price}€</Text></Text>
      <Text style = {styles.orderInfo}> Shipping costs are <Text style = {{ color: 'red' }}>{order.shippingCosts}€</Text></Text>
      <Text style={styles.orderInfo}> Your order is <Text style={{ color: 'red' }}>{order.status}</Text></Text>
    </View>

    <View style={styles.container}>
      <FlatList
        style={styles.container}
        data={product}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
      />
    </View>
    </>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  containerInfo: {
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  orderInfo: {
    marginTop: 10,
    fontSize: 30,
    alignSelf: 'center',
    color: 'black',
    justifyContent: 'center',
    borderRadius: 10
  }
})
