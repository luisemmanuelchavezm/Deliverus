/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList, Pressable, View, Image } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getAll } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import product from '../../../assets/product.jpeg'
import { getProductsPopular } from '../../api/ProductEndpoints'

export default function RestaurantsScreen ({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [productos, setProductos] = useState([])

  useEffect(() => {
    fetchRestaurants()
  }, [route])

  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getAll()
      const topProducts = await getTopProducts()
      setRestaurants(fetchedRestaurants)
      setProductos(topProducts)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderHeader = () => {
    return (
      <View>
        <View style = {styles.topTitleContainer} >
          <TextRegular textStyle={styles.topProductsTitle}>Top 3 products</TextRegular>
        </View>
        <FlatList
          data={productos}
          style={styles.header}
          renderItem={({ item }) => (
            <View style = {[{ backgroundColor: 'white', width: '120%', height: '100%', alignItems: 'center', borderRadius: 10 }]}>
            <View style={styles.headerContainers}>
              <Image
                source={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : product}
                style={styles.productImage}
              />
              <TextRegular textStyle={styles.productTitle}>{item.name}</TextRegular>
              <TextRegular>{item.restaurant.name}</TextRegular>
              <TextRegular>Price: {item.price}€</TextRegular>
              <TextRegular>{item.soldProductCount} units sold</TextRegular>
            </View>
            </View>
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    )
  }

  const getTopProducts = async () => {
    try {
      const popularProducts = await getProductsPopular()
      return popularProducts
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving Top Products from restaurants. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
      imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
      title={item.name}
    >

       <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
        <TextRegular>{item.products}</TextRegular>
        <View style={styles.actionButtonsContainer}>
        <Pressable
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandPrimaryTap
              : GlobalStyles.brandPrimary
          },
          styles.button
        ]}
      >
        <TextRegular textStyle={styles.text}>Go to Restaurant Detail Screen</TextRegular>
      </Pressable>
        </View>

        </ImageCard>
    )
  }

  return (
    <FlatList
      ListHeaderComponent={renderHeader(productos)}
      style={styles.container}
      data={restaurants}
      renderItem={renderRestaurant}
      keyExtractor={item => item.id.toString()}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    height: 250,
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly'

  },
  headerContainers: {
    alignSelf: 'center',
    width: '90%',
    height: '90%',
    marginTop: 10,
    justifyContent: 'center'

  },
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  topProductsTitle: {
    fontSize: 30,
    alignSelf: 'center',
    backgroundColor: GlobalStyles.brandPrimary,
    color: 'white',
    justifyContent: 'center'
  },
  productImage: {
    width: '100%',
    height: '60%',
    borderRadius: 8,
    marginBottom: 10
  },
  topTitleContainer: {
    backgroundColor: GlobalStyles.brandPrimary,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    width: '80%',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center'
  },
  productTitle: {
    fontSize: 20
  }
})
