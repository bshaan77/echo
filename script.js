// Global variable to store the verification result
let imageVerified = false;

function validateImage(file) {
    return new Promise((resolve, reject) => {
        // Convert the uploaded file to a data URL to be used in the request
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            const base64Image = reader.result.split(',')[1];
            sendRequest(base64Image)
                .then(isVerified => resolve(isVerified))
                .catch(err => reject(err));
        };
        reader.onerror = function(error) {
            reject('Error reading the file: ', error);
        };
    });
}

function sendRequest(base64Image) {
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = 'c44d148a1dd647c59ea2cffc05991fb7';
    const USER_ID = 'clarifai';       
    const APP_ID = 'main';
    const MODEL_ID = 'celebrity-face-recognition';
    const MODEL_VERSION_ID = '0676ebddd5d6413ebdaa101570295a39';    
    console.log('starting up checkimageAPI')
    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "base64": base64Image
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    return new Promise((resolve, reject) => {
        // ... (rest of the code remains unchanged)

        fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
            .then(response => response.json())
            .then(result => {
                const concepts = result.outputs[0].data.concepts;
                const highestValue = Math.max(...concepts.map(concept => concept.value));
                resolve(highestValue > 0.8);
            })
            .catch(error => {
                console.log('error', error);
                reject(false);
            });
    });
}

// Expose the validateImage function to the global scope so it can be called from the HTML
window.validateImage = validateImage;
