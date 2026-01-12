import codeExecutionService from '../services/codeExecutionService.js';
export const executeCode = async (req, res) => {
    try {
        const { language, code, stdin } = req.body;
        if (!language || !code) {
            return res.status(400).json({
                success: false,
                message: 'Language and code are required'
            });
        }
        // Validate code
        const validation = codeExecutionService.validateCode(language, code);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }
        // Execute code
        const result = await codeExecutionService.executeCode({
            language,
            code,
            stdin
        });
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error executing code'
        });
    }
};
export const getAvailableLanguages = async (req, res) => {
    try {
        const languages = await codeExecutionService.getAvailableLanguages();
        res.status(200).json({
            success: true,
            data: { languages }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching languages'
        });
    }
};
export const runTestCases = async (req, res) => {
    try {
        const { language, code, testCases } = req.body;
        if (!language || !code || !testCases || !Array.isArray(testCases)) {
            return res.status(400).json({
                success: false,
                message: 'Language, code, and testCases array are required'
            });
        }
        const result = await codeExecutionService.runTestCases(language, code, testCases);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error running test cases'
        });
    }
};
//# sourceMappingURL=codeController.js.map