// import { Response, Request } from "express"
// import { PrismaClient } from "@prisma/client"
// import { axiosONDCPost } from "../../shared/axios_call"
// import wrap from "../../shared/async_handler"
// import on_receiver_recon_payload from "../../mapper/rsp/on_receiver_recon"
// import on_receiver_recon_schema from "../../schemas/rsp/on_receiver_recon"
// import { addOnActionCall } from "../../magento/services/add_on_action"
// import { validateRequest } from "../../middleware/validation"
// import { logger } from "../../shared/logger"
// import { actions } from "../../shared/constants"
// const prisma = new PrismaClient()

// const on_receiver_recon = async (data: any): Promise<any> => {
//   try {
//     await addOnActionCall(on_receiver_recon_payload, null, false)
//     validateRequest(on_receiver_recon_schema, on_receiver_recon_payload)
//     await axiosONDCPost(actions.ON_RECEIVER_RECON, on_receiver_recon_payload, data.context.bap_uri)
//     return { data: on_receiver_recon_payload }
//   } catch (error: any) {
//     logger.error(`receiver_recon: ${(error as any)?.message}`)
//     return
//   }
// }

// const controller = {
//   /**
//    * INFO: Receive payment confirmation call from RSP and callback on_receiver_recon
//    */
//   receiver_recon: wrap(async (req: Request): Promise<void | Response> => {
//     const payload = req.body
//     logger.info(`Called - receiver_recon: ${JSON.stringify(payload)}`)
//     return await on_receiver_recon(payload)
//   }),

//   /**
//    * INFO: Controller for seller to update payment status
//    */
//   confirm_payment_status: wrap(async (req: Request, res: Response): Promise<void | Response> => {
//     const payload = req.body
//     const isExists = await prisma.orderDetails.findFirst({ where: { buyer_order_id: payload.order_id } })
//     if (isExists) {
//       await prisma.orderDetails.update({
//         where: { buyer_order_id: payload.order_id },
//         data: {
//           order_recon_status: payload.order_recon_status,
//           counterparty_recon_status: payload.counterparty_recon_status,
//           counterparty_diff_amount_value: payload.counterparty_diff_amount_value,
//           counterparty_diff_amount_currency: payload.counterparty_diff_amount_currency,
//           receiver_settlement_message: payload.receiver_settlement_message,
//           receiver_settlement_message_code: payload.receiver_settlement_message_code,
//           updated_at: new Date(),
//         },
//       })
//     }

//     return res.status(200).json({
//       status: true,
//       message: { ack: { status: "ACK" } },
//     })
//   }),
// }

// export default controller
