import React from 'react';
import { Upload } from 'lucide-react';

export default function Welcome() {
    return (
        <div className='welcome-page'>
            <h2>Let's get started!</h2>
            <p>Upload your vocab file:</p>
            <button id="uploadBtn">Upload
                <Upload/>
            </button>
            <p>Or try one of our curated selections!</p>
            <button class="sub-button">Chinese</button>
            <button class="sub-button">Spanish</button>
            <button class="sub-button">French</button>
            <button class="sub-button">German</button>
            <button class="sub-button">Portuguese</button>
            <button class="sub-button">Japanese</button>
        </div>
    )
}