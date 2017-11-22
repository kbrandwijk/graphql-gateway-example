import { GraphQLServer } from 'graphql-yoga'
import {
  fetchTypeDefs,
  RemoteSchema as Remote,
  collectTypeDefs,
  GraphcoolLink
} from 'graphql-remote'
import * as fs from 'fs'
import { account } from './resolvers/Mutation/account'
import { User } from './resolvers/User'
import { Home } from './resolvers/Home'
import { ExperiencesByCity } from './resolvers/ExperiencesByCity'
import { Viewer } from './resolvers/Viewer'
import { homepage } from './resolvers/Query/homepage'
import { book } from './resolvers/Mutation/book'
import { addPaymentMethod } from './resolvers/Mutation/addPaymentMethod'

async function run() {
  const makeLink = () =>
    new GraphcoolLink(process.env.GRAPHCOOL_SERVICE_ID, process.env.GRAPHCOOL_TOKEN)

  const graphcoolTypeDefs = await fetchTypeDefs(makeLink())

  const typeDefs = collectTypeDefs(
    graphcoolTypeDefs,
    `
    type Query {
      topExperiences: [Experience!]!
      topHomes: [Home!]!
      topReservations: [Reservation!]!
      featuredDestinations: [Neighbourhood!]!
      experiencesByCity(cities: [String!]!): [ExperiencesByCity!]!
      viewer: Viewer
    }

    type Viewer {
      me: User!
      bookings: [Booking!]!
    }

    type Mutation {
      signup(
        email: String!
        password: String!
        firstName: String!
        lastName: String!
        phone: String!
      ): User!
      login(email: String! password: String!): User!
      addPaymentMethod(
        cardNumber: String!
        expiresOnMonth: Int!
        expiresOnYear: Int!
        securityCode: String!
        firstName: String!
        lastName: String!
        postalCode: String!
        country: String!
      ): User!
      book(
        placeId: ID!
        checkIn: String!
        checkOut: String!
        numGuests: Int!
      ): BookingResult!
    }

    type BookingResult {
      success: Boolean!
    }

    type ExperiencesByCity {
      experiences: [Experience!]!
      city: City!
    }

    type Home {
      id: ID!
      name: String
      description: String!
      numRatings: Int!
      avgRating: Float!
      pictures(first: Int): [Picture!]!
    }

    type Reservation {
      id: ID!
      title: String!
      avgPricePerPerson: Int!
      pictures: [Picture!]!
      location: Location!
      isCurated: Boolean!
      slug: String!
      popularity: Int!
    }

    type Experience {
      id: ID!
      category: ExperienceCategory
      title: String!
      location: Location!
      pricePerPerson: Int!
      reviews: [Review!]!
      preview: Picture!
      popularity: Int!
    }

    type Review {
      accuracy: Int!
      checkIn: Int!
      cleanliness: Int!
      communication: Int!
      createdAt: DateTime!
      id: ID!
      location: Int!
      stars: Int!
      text: String!
      value: Int!
    }


    type Neighbourhood {
      id: ID!
      name: String!
      slug: String!
      homePreview: Picture
      city: City!
      featured: Boolean!
      popularity: Int!
    }

    type Location {
      id: ID!
      lat: Float!
      lng: Float!
      address: String
      directions: String
    }

    type Picture {
      id: ID!
      url: String!
    }

    type City {
      id: ID!
      name: String!
    }

    type ExperienceCategory {
      id: ID! @isUnique
      mainColor: String!
      name: String!
      experience: Experience
    }


    type User {
      bookings: [Booking!]
      createdAt: DateTime!
      email: String!
      firstName: String!
      hostingExperiences: [Experience!]
      id: ID!
      isSuperHost: Boolean!
      lastName: String!
      location: Location!
      notifications: [Notification!]
      ownedPlaces: [Place!]
      paymentAccount: [PaymentAccount!]
      phone: String!
      profilePicture: Picture
      receivedMessages: [Message!]
      responseRate: Float
      responseTime: Int
      sentMessages: [Message!]
      updatedAt: DateTime!
      token: String!
    }

    type PaymentAccount {
      id: ID!
      createdAt: DateTime!
      type: PAYMENT_PROVIDER
      user: User!
      payments: [Payment!]!
      paypal: PaypalInformation
      creditcard: CreditCardInformation
    }

    type Place {
      id: ID! @isUnique
      name: String
      size: PLACE_SIZES
      shortDescription: String!
      description: String!
      slug: String!
      maxGuests: Int!
      numBedrooms: Int!
      numBeds: Int!
      numBaths: Int!
      reviews: [Review!]!
      amenities: Amenities!
      host: User!
      pricing: Pricing!
      location: Location!
      views: PlaceViews!
      guestRequirements: GuestRequirements
      policies: Policies
      houseRules: HouseRules
      bookings: [Booking!]!
      pictures: [Picture!]
      popularity: Int!
    }

    type Booking {
      id: ID! @isUnique
      createdAt: DateTime!
      bookee: User!
      place: Place!
      startDate: DateTime!
      endDate: DateTime!
      payment: Payment!
    }

    type Notification {
      createdAt: DateTime!
      id: ID!
      link: String!
      readDate: DateTime!
      type: NOTIFICATION_TYPE
      user: User!
    }

    type Payment {
      booking: Booking!
      createdAt: DateTime!
      id: ID!
      paymentMethod: PaymentAccount!
      serviceFee: Float!
    }

    type PaypalInformation {
      createdAt: DateTime!
      email: String!
      id: ID!
      paymentAccount: PaymentAccount!
    }

    type CreditCardInformation {
      cardNumber: String!
      country: String!
      createdAt: DateTime!
      expiresOnMonth: Int!
      expiresOnYear: Int!
      firstName: String!
      id: ID!
      lastName: String!
      paymentAccount: PaymentAccount
      postalCode: String!
      securityCode: String!
    }

    type Message {
      createdAt: DateTime!
      deliveredAt: DateTime!
      id: ID!
      readAt: DateTime!
    }

    type Pricing {
      averageMonthly: Int!
      averageWeekly: Int!
      basePrice: Int!
      cleaningFee: Int
      currency: CURRENCY
      extraGuests: Int
      id: ID!
      monthlyDiscount: Int
      perNight: Int!
      securityDeposit: Int
      smartPricing: Boolean!
      weekendPricing: Int
      weeklyDiscount: Int
    }

    type PlaceViews {
      id: ID!
      lastWeek: Int!
    }

    type GuestRequirements {
      govIssuedId: Boolean!
      guestTripInformation: Boolean!
      id: ID!
      recommendationsFromOtherHosts: Boolean!
    }

    type Policies {
      checkInEndTime: Float!
      checkInStartTime: Float!
      checkoutTime: Float!
      createdAt: DateTime!
      id: ID!
      updatedAt: DateTime!
    }

    type HouseRules {
      additionalRules: String
      createdAt: DateTime!
      id: ID!
      partiesAndEventsAllowed: Boolean
      petsAllowed: Boolean
      smokingAllowed: Boolean
      suitableForChildren: Boolean
      suitableForInfants: Boolean
      updatedAt: DateTime!
    }

    type Amenities {
      airConditioning: Boolean!
      babyBath: Boolean!
      babyMonitor: Boolean!
      babysitterRecommendations: Boolean!
      bathtub: Boolean!
      breakfast: Boolean!
      buzzerWirelessIntercom: Boolean!
      cableTv: Boolean!
      changingTable: Boolean!
      childrensBooksAndToys: Boolean!
      childrensDinnerware: Boolean!
      crib: Boolean!
      doorman: Boolean!
      dryer: Boolean!
      elevator: Boolean!
      essentials: Boolean!
      familyKidFriendly: Boolean!
      freeParkingOnPremises: Boolean!
      freeParkingOnStreet: Boolean!
      gym: Boolean!
      hairDryer: Boolean!
      hangers: Boolean!
      heating: Boolean!
      hotTub: Boolean!
      id: ID!
      indoorFireplace: Boolean!
      internet: Boolean!
      iron: Boolean!
      kitchen: Boolean!
      laptopFriendlyWorkspace: Boolean!
      paidParkingOffPremises: Boolean!
      petsAllowed: Boolean!
      pool: Boolean!
      privateEntrance: Boolean!
      shampoo: Boolean!
      smokingAllowed: Boolean!
      suitableForEvents: Boolean!
      tv: Boolean!
      washer: Boolean!
      wheelchairAccessible: Boolean!
      wirelessInternet: Boolean!
    }
  `
  )

  fs.writeFileSync('./typeDefs.graphql', typeDefs)

  const resolvers = {
    Query: {
      ...homepage,
      viewer: () => ({})
    },
    Viewer,
    ExperiencesByCity,
    Home,
    Mutation: {
      ...account,
      book,
      addPaymentMethod
    },
    User
  }

  const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: req => ({ ...req, remote: new Remote(makeLink()) })
  })
  server.start(() => console.log('Server is running on localhost:4000'))
}

run().catch(console.log.bind(console))
