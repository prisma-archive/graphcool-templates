# Schema Extensions for SendCloud API

A set of schema extension queries and mutations that exposes the full [SendCloud API](https://docs.sendcloud.sc/api/v2/index.html) through your Graphcool endpoint. With SendCloud, you can create shipment labels for many carriers. SendCloud also supports tracking mails, service point deliveries, and more.

## Getting Started

- Sign up at https://www.sendcloud.eu/

- In the account settings, connect a new shop and select SendCloud API

- Note the Public Key and Secret Key from the integration page

- Replace the `__PUBLIC_KEY__` and `__SECRET_KEY__` in all functions with your actual API keys

- If you have a SendCloud Partner Id, you can set it in [create-parcel.js](./parcel-resource/create-parcel.js)

- Create Schema Extensions using the `.graphql` and `.js` files provided in this project

## Implemented queries

All SendCloud API endpoints are implemented.

### Parcel Resource (https://docs.sendcloud.sc/api/v2/index.html#parcel)

`getParcels(limit: Int, offset: Int)` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#parcel-list)

`getParcel(parcelId: Int!)` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#parcel-get)

`createParcel(parcel: Json!)` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#parcel-new)

`changeParcel(parcel: Json!)` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#parcel-update)

`cancelParcel(parcelId: Int!)` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#parcel-cancellation)

### Parcel Status Resource (https://docs.sendcloud.sc/api/v2/index.html#parcel-status)

`getParcelStatuses` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#parcel-status-list)

### Shipping Method Resource (https://docs.sendcloud.sc/api/v2/index.html#shippingmethod)

`getShippingMethods(senderAddressId: Int, getAll: Boolean)` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#shippingmethod-list)

`getShippingMethod(shippingMethodId: Int!)` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#shippingmethod-get)

### Label Resource (https://docs.sendcloud.sc/api/v2/index.html#label)

`getLabel(parcelId: Int!)` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#label-get)

`getLabel(parcels: [Int!]!)` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#label-new)

### User Resource (https://docs.sendcloud.sc/api/v2/index.html#user)

`getUser` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#user-get)

### Invoices Resource (https://docs.sendcloud.sc/api/v2/index.html#invoices)

`getUserInvoices` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#user-invoice)

### SenderAddress Resource (https://docs.sendcloud.sc/api/v2/index.html#sender_address)

`getSenderAddresses` - [Documentation](https://docs.sendcloud.sc/api/v2/index.html#sender_addresses)

## Contributions

Thanks so much [@kbrandwijk](https://github.com/kbrandwijk) for contributing this example! :tada:
