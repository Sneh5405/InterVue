const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    createAssessment,
    getAssessments,
    getAssessmentById,
    addQuestionsToAssessment,
    getInviteDetails,
    acceptInvite,
    getUpcomingAssessments,
    startAssessment,
    submitAnswer,
    finishAssessment,
    markCheated
} = require('../controllers/assessment');

// Candidate Routes (General)
router.get('/upcoming', authMiddleware, getUpcomingAssessments);

// HR Routes
router.post('/', authMiddleware, createAssessment);
router.get('/', authMiddleware, getAssessments);
router.get('/:id', authMiddleware, getAssessmentById);
router.post('/:id/questions', authMiddleware, addQuestionsToAssessment);

// Candidate Routes
router.get('/invite/:token', getInviteDetails);
router.post('/invite/:token/accept', authMiddleware, acceptInvite);
router.post('/:id/start', authMiddleware, startAssessment);
router.post('/:id/submit', authMiddleware, submitAnswer);
router.post('/:id/finish', authMiddleware, finishAssessment);
router.post('/:id/cheat', authMiddleware, markCheated);

module.exports = router;
