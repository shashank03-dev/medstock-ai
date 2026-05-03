import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import departmentsRouter from "./departments";
import hospitalsRouter from "./hospitals";
import skusRouter from "./skus";
import inventoryRouter from "./inventory";
import forecastsRouter from "./forecasts";
import expiryRouter from "./expiry";
import alertsRouter from "./alerts";
import crisisRouter from "./crisis";
import onboardingRouter from "./onboarding";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(departmentsRouter);
router.use(hospitalsRouter);
router.use(skusRouter);
router.use(inventoryRouter);
router.use(forecastsRouter);
router.use(expiryRouter);
router.use(alertsRouter);
router.use(crisisRouter);
router.use(onboardingRouter);

export default router;
