// import { PrismaClient } from "@prisma/client"
// import { logger } from "../shared/logger"
// const prisma: PrismaClient = new PrismaClient()

// export const onCollectorRecon = async (req: any): Promise<void> => {
//   try {
//     await Promise.all(
//       req.message.orderbook.orders.map(async (order: any) => {
//         await prisma.orderDetails.update({
//           where: {
//             buyer_order_id: order.id,
//           },
//           data: {
//             on_collector_recon_received: true,
//             updated_at: new Date(),
//           },
//         })
//       }),
//     )
//   } catch (e: any) {
//     logger.error(e.message)
//   }
// }
