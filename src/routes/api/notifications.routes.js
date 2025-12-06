import express from 'express';
import notificationsController from '../../controllers/notifications.controller.js';
import { validateInteger } from '../../middlewares/validateInteger.middleware.js';

const router = express.Router();

router.get('/', notificationsController.getAllNotifications);

router.get('/where', notificationsController.getNotificationWithWhere);
router.get('/:id', validateInteger('id'), notificationsController.getNotificationById);

router.get('/sender/:id', validateInteger('id'), notificationsController.getNotificationBySenderId);
router.get('/receiver/:id', validateInteger('id'), notificationsController.getNotificationByReceiverId);

router.post('/', notificationsController.createNotification);
router.put('/:id', validateInteger('id'), notificationsController.updateNotificationById);
router.delete('/:id', validateInteger('id'), notificationsController.deleteNotificationById);

export default router;