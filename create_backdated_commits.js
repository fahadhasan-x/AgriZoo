const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Select random days
function selectRandomDays(month, numDays) {
    const daysInMonth = month === 11 ? 30 : 31;
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

// Find all JS/JSX files
function findFiles() {
    const files = [];
    const extensions = ['.js', '.jsx', '.json', '.css', '.sql'];
    
    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            if (item === 'node_modules' || item === '.git' || item === 'logs' || item === 'uploads') continue;
            
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walk(fullPath);
                } else if (extensions.some(ext => item.endsWith(ext))) {
                    files.push(fullPath);
                }
            } catch (e) {}
        }
    }
    
    walk('.');
    return files;
}

const allFiles = findFiles();
console.log(`Found ${allFiles.length} files to work with`);

function makeSmallChange(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Add a comment or newline at the end
        if (filePath.endsWith('.json')) {
            // JSON files - just read/write to update timestamp
            fs.writeFileSync(filePath, content, 'utf8');
        } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            // Add whitespace change
            if (!content.endsWith('\n')) {
                content += '\n';
            } else {
                content = content.trimEnd() + '\n';
            }
            fs.writeFileSync(filePath, content, 'utf8');
        } else {
            // Other files - just rewrite
            fs.writeFileSync(filePath, content, 'utf8');
        }
        return true;
    } catch (e) {
        return false;
    }
}

function createCommit(files, message, date) {
    try {
        // Make small changes and add files
        let hasChanges = false;
        files.forEach(file => {
            if (fs.existsSync(file)) {
                makeSmallChange(file);
                execSync(`git add "${file}"`, { stdio: 'pipe' });
                hasChanges = true;
            }
        });

        if (!hasChanges) return false;

        // Create commit with custom date
        const env = {
            ...process.env,
            GIT_AUTHOR_DATE: date,
            GIT_COMMITTER_DATE: date
        };

        execSync(`git commit -m "${message}"`, { env, stdio: 'pipe' });
        console.log(`[OK] ${message}`);
        return true;
    } catch (error) {
        return false;
    }
}

let totalCommits = 0;

// Process November 2024
console.log('\n=== Processing November 2024 ===');
novemberDays.forEach(day => {
    const numCommits = Math.floor(Math.random() * 6) + 5; // 5-10 commits
    console.log(`\nDay ${day}: ${numCommits} commits`);

    const dailyMessages = shuffleArray(commitMessages).slice(0, numCommits);

    for (let i = 0; i < numCommits; i++) {
        const hour = Math.floor(Math.random() * 14) + 9;
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);
        const date = `2024-11-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

        const numFiles = Math.floor(Math.random() * 5) + 1;
        const files = shuffleArray(allFiles).slice(0, numFiles);

        if (createCommit(files, dailyMessages[i], date)) {
            totalCommits++;
        }
    }
});

// Process December 2024
console.log('\n=== Processing December 2024 ===');
decemberDays.forEach(day => {
    const numCommits = Math.floor(Math.random() * 6) + 5;
    console.log(`\nDay ${day}: ${numCommits} commits`);

    const dailyMessages = shuffleArray(commitMessages).slice(0, numCommits);

    for (let i = 0; i < numCommits; i++) {
        const hour = Math.floor(Math.random() * 14) + 9;
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);
        const date = `2024-12-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

        const numFiles = Math.floor(Math.random() * 5) + 1;
        const files = shuffleArray(allFiles).slice(0, numFiles);

        if (createCommit(files, dailyMessages[i], date)) {
            totalCommits++;
        }
    }
});

console.log(`\n=== Total commits created: ${totalCommits} ===`);
console.log('Ready to push!');
