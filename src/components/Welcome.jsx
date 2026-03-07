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
            <button className="sub-button">Chinese</button>
            <button className="sub-button">Spanish</button>
            <button className="sub-button">French</button>
            <button className="sub-button">German</button>
            <button className="sub-button">Portuguese</button>
            <button className="sub-button">Japanese</button>
        </div>
    )
}