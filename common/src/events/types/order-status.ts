export enum OrderStatus {
  Created = 'created', // When the order has been created, but the ticket trying to ordering has not been reserved
  Cancelled = 'cancelled', // The ticket the order is trying to reserve has already been reserved or when the user has cancelled the order. Or the order expires before payment
  AwaitingPayment = 'awaiting:payment', // The order has successfully reserved the ticket
  Completed = 'completed', // The order has reserved the ticket and the user has provided payment successfully
}
