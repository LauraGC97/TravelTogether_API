import express from 'express';
import messagesController from '../../controllers/messages.controller.js';
import { validateInteger } from '../../middlewares/validateInteger.middleware.js';

const router = express.Router();

router.get('/', messagesController.getAllMessages);

router.get('/where', messagesController.getMessageWithWhere);
router.get('/:id', validateInteger('id'), messagesController.getMessageById);

router.get('/sender/:id', validateInteger('id'), messagesController.getNotificationBySenderId);
router.get('/receiver/:id', validateInteger('id'), messagesController.getNotificationByReceiverId);

router.post('/', messagesController.createMessage);
router.put('/:id', validateInteger('id'), messagesController.updateMessageById);
router.delete('/:id', validateInteger('id'), messagesController.deleteMessageById);

export default router;