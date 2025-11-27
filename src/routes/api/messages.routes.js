import express from 'express';
import messagesController from '../../controllers/messages.controller.js';

const router = express.Router();

router.get('/', messagesController.getAllMessages);

router.get('/where', messagesController.getMessageWithWhere);
router.get('/:id', messagesController.getMessageById);

router.get('/sender/:id', messagesController.getNotificationBySenderId);
router.get('/receiver/:id', messagesController.getNotificationByReceiverId);

router.post('/', messagesController.createMessage);
router.put('/:id', messagesController.updateMessageById);
router.delete('/:id', messagesController.deleteMessageById);

export default router;