import * as THREE from 'three';

/**
 * Creates and configures a THREE.LoadingManager that tracks all loading operations
 * @param {HTMLElement} currentDownloaderElement - Element to display current asset being downloaded
 * @param {Function} onLoad - Callback when all assets are loaded
 * @returns {THREE.LoadingManager} The configured loading manager
 */
export function createLoadingManager(currentDownloaderElement, onLoad) {
    // Create a more resilient loading manager
    const loadingManager = new THREE.LoadingManager();

    // Track loading progress
    const progressBar = document.createElement('div');
    progressBar.style.display = 'none';
    progressBar.id = 'loading-progress-bar';

    const progressBarInner = document.createElement('div');
    progressBarInner.id = 'loading-progress-inner';
    progressBar.appendChild(progressBarInner);

    document.getElementById('loading').appendChild(progressBar);

    // Total resources being tracked
    let totalResources = 0;
    let loadedResources = 0;
    let isCompleteTriggered = false;
    const startTime = Date.now();

    // Called when loading starts
    loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
        totalResources = Math.max(totalResources, itemsTotal);
        const assetType = getAssetType(url);
        currentDownloaderElement.innerText = `Loading ${assetType} assets...`;
    };

    // Called when an item starts loading
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        totalResources = Math.max(totalResources, itemsTotal);
        loadedResources = itemsLoaded;

        // Calculate progress percentage
        const progress = (itemsLoaded / itemsTotal) * 100;
        progressBarInner.style.width = `${progress}%`;

        // Update text to show what's currently loading
        const assetName = url.split('/').pop();
        const assetType = getAssetType(url);
        currentDownloaderElement.innerText = `Loading ${assetType}: ${assetName}`;

        // Show time elapsed for long-running loads
        const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        if (timeElapsed > 2) {
            currentDownloaderElement.innerText += ` (${timeElapsed}s)`;
        }
    };  // Called when all loading is completed
    loadingManager.onLoad = () => {
        // Prevent multiple calls to onLoad
        if (isCompleteTriggered) return;

        // Double-check if resources match
        if (loadedResources >= totalResources) {
            currentDownloaderElement.innerText = 'All assets loaded successfully!';
            progressBarInner.style.width = '100%';
            progressBar.classList.add('complete');

            // Wait a longer moment to ensure textures are processed
            setTimeout(() => {
                if (!isCompleteTriggered) {
                    isCompleteTriggered = true;
                    if (onLoad) onLoad();
                }
            }, 1000); 
        } else {
            // Safety check
            console.warn(`Loading manager reports complete but only ${loadedResources}/${totalResources} resources loaded. Waiting...`);
            currentDownloaderElement.innerText = `Finalizing... (${loadedResources}/${totalResources})`;

            // Check again in a moment
            setTimeout(() => {
                if (!isCompleteTriggered) {
                    isCompleteTriggered = true;
                    loadedResources = totalResources; // Force completion after wait
                    currentDownloaderElement.innerText = 'All assets loaded successfully!';
                    progressBarInner.style.width = '100%';
                    progressBar.classList.add('complete');

                    if (onLoad) onLoad();
                }
            }, 2000);
        }
    };
    // Called when loading errors
    loadingManager.onError = (url) => {
        console.error('Error loading asset:', url);
        currentDownloaderElement.innerText = `Error loading: ${url.split('/').pop()}`;

        // Make error visible and noticeable
        progressBar.classList.add('error');
        progressBarInner.style.backgroundColor = '#ff3333';

        // Still allow user to proceed after errors, but wait longer to ensure they see the error
        setTimeout(() => {
            if (onLoad) onLoad();
        }, 2000);
    };

    return loadingManager;
}

/**
 * Determine asset type from URL for better feedback
 * @param {string} url - Asset URL
 * @returns {string} The asset type description
 */
function getAssetType(url) {
    if (!url) return 'resource';

    const extension = url.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        return 'texture';
    } else if (['glb', 'gltf'].includes(extension)) {
        return '3D model';
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        return 'audio';
    } else {
        return 'resource';
    }
}
