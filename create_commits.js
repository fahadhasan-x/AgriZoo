const { execSync } = require('child_process');
const fs = require('fs');

// Select random days
function selectRandomDays(month, numDays) {
    const daysInMonth = month === 11 ? 30 : 31; // November=30, December=31
    const days = [];
    while (days.length < numDays) {
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        if (!days.includes(day)) {
            days.push(day);
        }
    }
    return days.sort((a, b) => a - b);
}

const novemberDays = selectRandomDays(11, 18);
const decemberDays = selectRandomDays(12, 17);

console.log('November 2024 days:', novemberDays);
console.log('December 2024 days:', decemberDays);

// All files to commit
const allFiles = [
    '.gitignore',
    'backend/app.js',
    'backend/config/database.js',
    'backend/config/logger.js',
    'backend/config/mailer.js',
    'backend/config/multer.js',
    'backend/config/sync.js',
    'backend/controllers/aiController.js',
    'backend/controllers/authController.js',
    'backend/controllers/categoryController.js',
    'backend/controllers/postController.js',
    'backend/controllers/productController.js',
    'backend/controllers/searchController.js',
    'backend/controllers/userController.js',
    'backend/middleware/auth.js',
    'backend/middleware/upload.js',
    'backend/models/Category.js',
    'backend/models/Comment.js',
    'backend/models/Like.js',
    'backend/models/Post.js',
    'backend/models/Product.js',
    'backend/models/User.js',
    'backend/models/index.js',
    'backend/routes/api.js',
    'backend/routes/categoryRoutes.js',
    'backend/routes/userRoutes.js',
    'backend/package.json',
    'backend/package-lock.json',
    'database-schema.sql',
    'frontend/package.json',
    'frontend/package-lock.json',
    'frontend/postcss.config.js',
    'frontend/tailwind.config.js',
    'frontend/public/index.html',
    'frontend/public/manifest.json',
    'frontend/src/App.css',
    'frontend/src/App.js',
    'frontend/src/App.test.js',
    'frontend/src/index.css',
    'frontend/src/index.js',
    'frontend/src/reportWebVitals.js',
    'frontend/src/setupTests.js',
    'frontend/src/components/CategorySelector.js',
    'frontend/src/components/Navbar.js',
    'frontend/src/components/Post.js',
    'frontend/src/components/PostCard.js',
    'frontend/src/components/PrivateRoute.js',
    'frontend/src/components/SearchBox.js',
    'frontend/src/config/axios.js',
    'frontend/src/context/AuthContext.js',
    'frontend/src/pages/ForgotPassword.js',
    'frontend/src/pages/Home.js',
    'frontend/src/pages/Login.js',
    'frontend/src/pages/MyShop.js',
    'frontend/src/pages/Profile.js',
    'frontend/src/pages/ResetPassword.js',
    'frontend/src/pages/SearchResults.js',
    'frontend/src/pages/Signup.js',
    'frontend/src/pages/UserProfile.js',
    'frontend/src/pages/UserShop.js',
    'frontend/src/pages/ZooShop.js',
    'frontend/src/services/authService.js',
    'frontend/src/services/postService.js',
    'frontend/src/services/userService.js',
    'frontend/src/utils/dateUtils.js',
    'postcss.config.js',
    'tailwind.config.js',
    'project-structure'
];

const commitMessages = [
    'Add initial project setup',
    'Configure database connection',
    'Add user authentication',
    'Create user model and controller',
    'Add post creation functionality',
    'Implement comment system',
    'Add product listing feature',
    'Create category management',
    'Add search functionality',
    'Implement AI controller',
    'Add image upload support',
    'Create frontend components',
    'Add authentication context',
    'Implement private routes',
    'Add user profile page',
    'Create shop functionality',
    'Add post card component',
    'Implement navbar',
    'Add search box component',
    'Create login page',
    'Add signup functionality',
    'Implement password reset',
    'Add forgot password feature',
    'Create home page',
    'Add search results page',
    'Implement user shop page',
    'Add my shop page',
    'Create zoo shop page',
    'Add category selector',
    'Implement date utilities',
    'Add axios configuration',
    'Create auth service',
    'Add post service',
    'Implement user service',
    'Add logger configuration',
    'Configure mailer',
    'Add multer configuration',
    'Implement database sync',
    'Add middleware authentication',
    'Create API routes',
    'Add category routes',
    'Implement user routes',
    'Update package dependencies',
    'Add Tailwind CSS configuration',
    'Configure PostCSS',
    'Add database schema',
    'Update product controller',
    'Improve search algorithm',
    'Enhance UI components',
    'Fix authentication bugs',
    'Optimize database queries',
    'Add error handling',
    'Improve code structure',
    'Update styling',
    'Refactor components',
    'Add validation',
    'Improve security',
    'Update documentation',
    'Fix responsive design',
    'Add loading states',
    'Improve error messages',
    'Update API endpoints',
    'Add data validation',
    'Improve file upload',
    'Update user interface',
    'Fix form validation',
    'Add success messages',
    'Improve navigation',
    'Update models',
    'Fix database relations',
    'Add indexes',
    'Improve performance',
    'Update controllers',
    'Fix API responses',
    'Add pagination',
    'Improve filtering',
    'Update search feature',
    'Fix sorting',
    'Add category filtering',
    'Improve product display',
    'Update post listing',
    'Fix comment system',
    'Add like functionality',
    'Improve user profile',
    'Update shop features',
    'Fix image handling',
    'Add image optimization',
    'Improve upload system',
    'Update authentication flow',
    'Fix password reset',
    'Add email verification',
    'Improve security measures',
    'Update middleware',
    'Fix route handling',
    'Add request validation',
    'Improve error logging',
    'Update configuration',
    'Fix environment setup'
];

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createCommit(files, message, date) {
    try {
        // Add files
        files.forEach(file => {
            if (fs.existsSync(file)) {
                execSync(`git add "${file}"`, { stdio: 'pipe' });
            }
        });

        // Create commit with custom date
        const env = {
            ...process.env,
            GIT_AUTHOR_DATE: date,
            GIT_COMMITTER_DATE: date
        };

        execSync(`git commit -m "${message}"`, { env, stdio: 'pipe' });
        console.log(`[OK] ${message} (${date})`);
        return true;
    } catch (error) {
        // Ignore errors (might be no changes)
        return false;
    }
}

// Reset any staged changes first
try {
    execSync('git reset', { stdio: 'pipe' });
} catch (e) {}

let totalCommits = 0;

// Process November 2024
console.log('\n=== Processing November 2024 ===');
novemberDays.forEach(day => {
    const numCommits = Math.floor(Math.random() * 6) + 5; // 5-10 commits
    console.log(`\nDay ${day}: ${numCommits} commits planned`);

    const dailyFiles = shuffleArray(allFiles);
    const dailyMessages = shuffleArray(commitMessages).slice(0, numCommits);

    let fileIndex = 0;
    for (let i = 0; i < numCommits; i++) {
        const hour = Math.floor(Math.random() * 14) + 9; // 9-22
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);
        const date = `2024-11-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

        const numFiles = Math.floor(Math.random() * 5) + 1; // 1-5 files
        const files = dailyFiles.slice(fileIndex, fileIndex + numFiles);
        fileIndex = (fileIndex + numFiles) % dailyFiles.length;

        if (files.length > 0) {
            if (createCommit(files, dailyMessages[i], date)) {
                totalCommits++;
            }
        }
    }
});

// Process December 2024
console.log('\n=== Processing December 2024 ===');
decemberDays.forEach(day => {
    const numCommits = Math.floor(Math.random() * 6) + 5; // 5-10 commits
    console.log(`\nDay ${day}: ${numCommits} commits planned`);

    const dailyFiles = shuffleArray(allFiles);
    const dailyMessages = shuffleArray(commitMessages).slice(0, numCommits);

    let fileIndex = 0;
    for (let i = 0; i < numCommits; i++) {
        const hour = Math.floor(Math.random() * 14) + 9; // 9-22
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);
        const date = `2024-12-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

        const numFiles = Math.floor(Math.random() * 5) + 1; // 1-5 files
        const files = dailyFiles.slice(fileIndex, fileIndex + numFiles);
        fileIndex = (fileIndex + numFiles) % dailyFiles.length;

        if (files.length > 0) {
            if (createCommit(files, dailyMessages[i], date)) {
                totalCommits++;
            }
        }
    }
});

console.log(`\n=== Total commits created: ${totalCommits} ===`);
console.log('Now you can push with: git push origin main --force');
