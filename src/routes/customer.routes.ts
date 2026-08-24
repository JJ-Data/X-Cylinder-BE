import { Router } from 'express';
import { customerController } from '@controllers/customer.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';
import { enforceOutletAccess, addOutletFilter } from '@middlewares/outlet.middleware';
import { validate } from '@middlewares/validation.middleware';
import { customerValidation } from '@utils/validation';
import { CONSTANTS } from '@config/constants';

const router = Router();

// Public routes (no authentication required)
// Customer self-registration
router.post(
  '/register',
  validate(customerValidation.register),
  customerController.registerCustomer
);

// Activate customer account (payment callback)
router.post(
  '/activate',
  validate(customerValidation.activate),
  customerController.activateCustomer
);

// All routes below require authentication
router.use(authenticate);

// Apply outlet access control for staff
router.use(enforceOutletAccess);

// Search customers (Admin and Staff) - no automatic outlet filtering
// Staff can see all customers as customers can visit any outlet
router.get(
  '/',
  authorize(CONSTANTS.USER_ROLES.ADMIN, CONSTANTS.USER_ROLES.STAFF),
  // addOutletFilter removed - staff can see all customers for lease creation
  validate(customerValidation.search, 'query'),
  customerController.searchCustomers
);

// Get customers by outlet (Admin and Staff)
router.get(
  '/outlet/:outletId',
  authorize(CONSTANTS.USER_ROLES.ADMIN, CONSTANTS.USER_ROLES.STAFF),
  customerController.getCustomersByOutlet
);

// Get own customer profile (Customer only) - self-service, no need to know own User.id
router.get(
  '/me',
  authorize(CONSTANTS.USER_ROLES.CUSTOMER),
  customerController.getCustomerById
);

// Get own dashboard (Customer only)
router.get(
  '/me/dashboard',
  authorize(CONSTANTS.USER_ROLES.CUSTOMER),
  customerController.getCustomerDashboard
);

// Get own history (Customer only)
router.get(
  '/me/history',
  authorize(CONSTANTS.USER_ROLES.CUSTOMER),
  customerController.getCustomerHistory
);

// Get customer by ID (Customer can see own, Staff/Admin can see any)
router.get(
  '/:id',
  authorize(CONSTANTS.USER_ROLES.ADMIN, CONSTANTS.USER_ROLES.STAFF, CONSTANTS.USER_ROLES.CUSTOMER),
  customerController.getCustomerById
);

// Get customer dashboard - own summary metrics (Customer can see own, Staff/Admin can see any)
router.get(
  '/:id/dashboard',
  authorize(CONSTANTS.USER_ROLES.ADMIN, CONSTANTS.USER_ROLES.STAFF, CONSTANTS.USER_ROLES.CUSTOMER),
  customerController.getCustomerDashboard
);

// Get customer history - leases and swaps (Customer can see own, Staff/Admin can see any)
router.get(
  '/:id/history',
  authorize(CONSTANTS.USER_ROLES.ADMIN, CONSTANTS.USER_ROLES.STAFF, CONSTANTS.USER_ROLES.CUSTOMER),
  customerController.getCustomerHistory
);

// Resend payment link (Admin and Staff)
router.post(
  '/:userId/resend-payment',
  authorize(CONSTANTS.USER_ROLES.ADMIN, CONSTANTS.USER_ROLES.STAFF),
  customerController.resendPaymentLink
);

// Deactivate customer (Admin only)
router.post(
  '/:id/deactivate',
  authorize(CONSTANTS.USER_ROLES.ADMIN),
  validate(customerValidation.deactivate),
  customerController.deactivateCustomer
);

export const customerRoutes: Router = router;
