import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, Pressable, FlatList, ScrollView } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { getAllorders, removeOrder } from '../../api/OrderEndpoints'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import DeleteModal from '../../components/DismissOrderModal'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function OrdersScreen ({ navigation, route }) {
  const [order, setOrder] = useState([])
  const [dismissDestroy, setDismissDestroy] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchAllOrder()
    } else {
      setOrder(null)
    }
  }, [route, loggedInUser, order])

  const fetchAllOrder = async () => {
    try {
      const fetchedOrder = await getAllorders()
      setOrder(fetchedOrder)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving product details (id ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No orders were retrieved. Are you logged in?
      </TextRegular>
    )
  }

  const renderProduct = ({ item }) => {
    return (

      <ImageCard
      imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogo}
      title={item.id}
    >
    <View style={styles.containerInfo}>
      <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
      <TextRegular>Created at {new Date(item.createdAt).toLocaleString()}</TextRegular>
      <TextRegular>Status: <TextRegular style={{ color: 'red' }}> {item.status}</TextRegular></TextRegular>
    </View>

      <View style={styles.buttonsContainer}>
      {item.status === 'pending' &&
        <View style={styles.actionButtonsContainer}>

        <Pressable
          onPress={() => {
            setOrderId(item.id)
            setDismissDestroy(true)
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
          <TextRegular textStyle={styles.text}> Delete </TextRegular>
        </Pressable>
      </View>
  }
      {item.status === 'pending' &&
      <View style={styles.actionButtonsContainer}>
      <Pressable
        onPress={() => {
          navigation.navigate('EditOrderScreen', { id: item.id })
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
        <TextRegular textStyle={styles.text}> Edit </TextRegular>

      </Pressable>
      </View>
  }

      <View style={styles.actionButtonsContainer}>
      <Pressable
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
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
        <TextRegular textStyle={styles.text}> Details </TextRegular>
      </Pressable>
      </View>
      </View>
    </ImageCard>

    )
  }

  const destroyOrderFunc = async () => {
    try {
      await removeOrder(orderId)
      showMessage({
        message: 'Order removed',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('My Orders', { dirty: true })
    } catch (error) {
      showMessage({
        message: `Problems while creating order: ${error}`,
        type: 'danger',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <>
    <ScrollView>
      <DeleteModal
        isVisible={dismissDestroy}
        onCancel={() => setDismissDestroy(false)}
        onConfirm={() => {
          destroyOrderFunc()
          setDismissDestroy(false)
        }}
      />
    <View>
        <FlatList
          data={order}
          renderItem={renderProduct}
          ListEmptyComponent={renderEmptyOrdersList}
          keyExtractor={item => item.id.toString()}
        />
    </View>

    </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  containerInfo: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'center'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    width: '30%'
  },
  buttonsContainer: {
    width: '60%',
    height: '40%',
    flexDirection: 'row',
    alignSelf: 'flex-start'
  },

  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  }
})
