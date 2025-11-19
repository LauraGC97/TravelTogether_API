import express from 'express';
import notificationsController from '../../controllers/notifications.controller.js';

const router = express.Router();

router.get('/', notificationsController.getAllNotifications);

router.get('/where', notificationsController.getNotificationWithWhere);
router.get('/:id', notificationsController.getNotificationById);

router.get('/sender/:id', notificationsController.getNotificationBySenderId);
router.get('/receiver/:id', notificationsController.getNotificationByReceiverId);

router.post('/', notificationsController.createNotification);
router.put('/:id', notificationsController.updateNotificationById);
router.delete('/:id', notificationsController.deleteNotificationById);

export default router;