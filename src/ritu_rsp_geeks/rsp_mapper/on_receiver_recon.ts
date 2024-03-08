// import { v4 as uuidv4 } from "uuid"
// import { PrismaClient } from "@prisma/client"
// const prisma = new PrismaClient()
// import { actions, constants, recon_status } from "../../shared/constants"

// /**
//  * @apigroup on_receiver_recon
//  * INFO: Prepare payload as on_receiver_recon
//  * @param payload
//  * @returns
//  */
// const on_receiver_recon = async (payload: any): Promise<any> => {
//   const body = await on_receiver_recon_payload(payload)
//   return body
// }

// export default on_receiver_recon

// /**
//  * @apigroup on_receiver_recon
//  * INFO: Prepare on_receiver_recon request body
//  * @param payload
//  * @returns
//  */
// const on_receiver_recon_payload = async (payload: any) => {
//   const currentTimestamp = new Date().toISOString()
//   const context = {
//     domain: payload.domain,
//     country: constants.COUNTRY,
//     city: payload.city,
//     action: actions.ON_RECEIVER_RECON,
//     core_version: constants.CORE_VERSION,
//     bap_id: payload.bap_id,
//     bap_uri: payload.bap_uri,
//     bpp_id: payload.bpp_id,
//     bpp_uri: payload.bpp_uri,
//     transaction_id: payload.transaction_id,
//     message_id: uuidv4(),
//     timestamp: currentTimestamp,
//     ttl: constants.TTL2D,
//   }
//   const message = await mapSettlementDetails(payload?.orderBook)

//   return { context, message }
// }

// /**
//  * @apigroup on_receiver_recon
//  * INFO: Function to map orderbook data from collect_recon payload
//  * @param orders
//  * @returns
//  */
// const mapSettlementDetails = async (orders: any) => {
//   const mappedOrders = await Promise.all(
//     orders.map(async (order: any) => {
//       return await mapOrderBook(order)
//     }),
//   )
//   return {
//     orderbook: {
//       orders: mappedOrders,
//     },
//   }
// }

// /**
//  * @apigroup on_receiver_recon
//  * INFO: maping orders for on_receiver_recon payload
//  * @param orderBook
//  * @returns
//  */
// const mapOrderBook = async (orderBook: any) => {
//   const settlementData: any = await prisma.orderDetails.findFirst({
//     where: { buyer_order_id: orderBook.order_id },
//   })
//   return {
//     id: orderBook.order_id,
//     invoice_no: orderBook.invoice_no,
//     collector_app_id: orderBook.collector_app_id,
//     receiver_app_id: orderBook.receiver_app_id,
//     order_recon_status: settlementData?.order_recon_status || recon_status.NOTPAID,
//     transaction_id: orderBook.payment_params_transaction_id,
//     settlement_id: orderBook.settlement_id,
//     settlement_reference_no: orderBook.settlement_reference_no,
//     counterparty_recon_status: settlementData?.order_recon_status || recon_status.NOTPAID,
//     counterparty_diff_amount: {
//       currency: settlementData?.counterparty_diff_amount_currency || constants.CURRENCY_TYPE,
//       value: settlementData?.counterparty_diff_amount_value || "0",
//     },
//     message: {
//       name: settlementData?.receiver_settlement_message || "Not paid",
//       code: settlementData?.receiver_settlement_message_code || "notpaid",
//     },
//   }
// }
