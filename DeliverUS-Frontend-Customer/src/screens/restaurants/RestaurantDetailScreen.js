/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import { createOrder } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import ConfirmOrderModal from '../../components/ConfirmOrderModal'
import DismissOrderModal from '../../components/DismissOrderModal'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [restaurant, setRestaurant] = useState({})
  const [products, setProducts] = useState([])
  const [productQuantity, setProductQuantity] = useState(new Map())
  const [orderToBeConfirmed, setOrderToBeConfirmed] = useState(null)
  const [dismissOrder, setDismissOrder] = useState(false)
  const [address, setAddress] = useState('')
  const [productsInOrder, setProductsInOrder] = useState([])

  useEffect(() => {
    fetchRestaurantAndProductsDetail()
  }, [route])

  useEffect(() => {
    if (restaurant.products) {
      const productQuantityMap = new Map()
      restaurant.products.forEach(product => {
        productQuantityMap.set(product.id, 0)
      })
      setProductQuantity(productQuantityMap)
    }
  }, [restaurant])

  useEffect(() => {
    const productsNewOrder = products.filter(p => productQuantity.get(p.id) > 0)
    setProductsInOrder(productsNewOrder)
  }, [orderToBeConfirmed, productQuantity])

  const confirmOrder = () => {
    const selectedProducts = [...productQuantity].filter(([_, quantity]) => quantity > 0)
    if (selectedProducts.length > 0) {
      const orderData = { address, restaurantId: route.params.id, products: selectedProducts }
      setOrderToBeConfirmed(orderData)
    } else {
      showMessage({
        message: 'Select a product to confirm an order',
        type: 'danger',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderHeader = () => (
    <View>
      <ImageBackground source={restaurant.heroImage ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
        <View style={styles.restaurantHeaderContainer}>
          <TextSemiBold style={styles.textTitle}>{restaurant.name}</TextSemiBold>
          <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
          <TextRegular style={styles.description}>{restaurant.description}</TextRegular>
          <TextRegular style={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
        </View>
      </ImageBackground>
      <Pressable
        onPress={ () => {
          if (loggedInUser) {
            setAddress(loggedInUser.address)
            confirmOrder()
          } else {
            showMessage({
              message: 'To make an order, you must be logged in',
              type: 'danger',
              style: GlobalStyles.flashStyle,
              titleStyle: GlobalStyles.flashTextStyle
            })
            navigation.navigate('Profile')
          }
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandPrimaryTap
              : GlobalStyles.brandPrimary
          },
          styles.button
        ]}>
        <View style={styles.buttonContent}>
          <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
          <TextRegular style={styles.text}>
            Confirm order
          </TextRegular>
        </View>
      </Pressable>
      <Pressable
        onPress={() => setDismissOrder(true)}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandGreenTap
              : GlobalStyles.brandGreen
          },
          styles.button
        ]}>
        <View style={styles.buttonContent}>
          <MaterialCommunityIcons name='minus-circle' color={'white'} size={20} />
          <TextRegular style={styles.text}>
            Dismiss order
          </TextRegular>
        </View>
      </Pressable>
    </View>
  )

  const renderProduct = ({ item }) => {
    const isProductAvailable = item.availability === true
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold style={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {isProductAvailable &&
            <View style={styles.actionButtonsContainer}>
              <Pressable
                onPress={() => decrementProductQuantity(item.id)}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandGreenTap
                      : GlobalStyles.brandGreen
                  },
                  styles.actionButton
                ]}>
                <MaterialCommunityIcons name='minus-circle' color={'white'} size={20} />
              </Pressable>
              <View style={styles.quantityBorder}>
                <TextRegular style={styles.quantityText}>
                  {productQuantity.get(item.id)}
                </TextRegular>
              </View>
              <Pressable
                onPress={() => incrementProductQuantity(item.id)}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandPrimaryTap
                      : GlobalStyles.brandPrimary
                  },
                  styles.actionButton
                ]}>
                <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
              </Pressable>
            </View>
        }
        {!isProductAvailable &&
          <View style={styles.actionButtonsContainer}>
            <TextRegular style={styles.availability}>Not available</TextRegular>
          </View>
        }
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => (
    <TextRegular style={styles.emptyList}>
      This restaurant has no products yet.
    </TextRegular>
  )

  const fetchRestaurantAndProductsDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
      setProducts(fetchedRestaurant.products)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const incrementProductQuantity = (productId) => {
    const newQuantity = productQuantity.get(productId) + 1
    setProductQuantity(new Map(productQuantity.set(productId, newQuantity)))
  }

  const decrementProductQuantity = (productId) => {
    const currentQuantity = productQuantity.get(productId)
    if (currentQuantity > 0) {
      const newQuantity = currentQuantity - 1
      setProductQuantity(new Map(productQuantity.set(productId, newQuantity)))
    }
  }

  const createOrderFunc = async () => {
    try {
      const orderData = { address, restaurantId: route.params.id, products: [...productQuantity].filter(([productId, quantity]) => quantity > 0).map(([productId, quantity]) => ({ productId, quantity })) }
      await createOrder(orderData)
      showMessage({
        message: 'Order created',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('My Orders', { dirty: true })
    } catch (error) {
      showMessage({
        message: `There were problems while creating order: ${error}`,
        type: 'danger',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <>
      <ConfirmOrderModal
        shippingCosts={restaurant.shippingCosts}
        data={productsInOrder}
        quantities={productQuantity}
        isVisible={orderToBeConfirmed !== null}
        onCancel={() => setOrderToBeConfirmed(null)}
        onConfirm={() => {
          createOrderFunc()
          setOrderToBeConfirmed(null)
        }}
        addr={address}
        setAddr={setAddress}
      />
      <DismissOrderModal
        isVisible={dismissOrder}
        onCancel={() => setDismissOrder(false)}
        onConfirm={() => {
          const resetQuantityMap = new Map()
          restaurant.products.forEach(product => {
            resetQuantityMap.set(product.id, 0)
          })
          setProductQuantity(resetQuantityMap)
          setDismissOrder(false)
        }}
      />
      <FlatList
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyProductsList}
        style={styles.container}
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'center',
    fontSize: 20,
    fontStyle: 'italic',
    marginRight: 70,
    color: 'red'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 5,
    padding: 10,
    alignSelf: 'end',
    flexDirection: 'row',
    width: '4%',
    margin: '1%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    width: '90%',
    alignSelf: 'center',
    marginTop: 30,
    justifyContent: 'flex-end'
  },
  quantityBorder: {
    borderWidth: 1,
    marginTop: 5,
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '4%',
    margin: '1%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityText: {
    justifyContent: 'space-around',
    alignSelf: 'center'
  }
})
