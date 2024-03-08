import { CronJob } from "cron"
import { initiateRsp } from "./collector_recon.js"
// import { logger } from "../../shared/logger.js"
const isRedisEnabled = process.env.REDIS_SERVICE_ENABLED === "true"


export const schedulerEachDay = () => {
  new CronJob(
    "*/500 * * * *",
    async () => {
      console.log(`Inside schedulerEachDay`)
      await initiateRsp()
    },
    null,
    true,
    "Asia/Calcutta",
  )
} 