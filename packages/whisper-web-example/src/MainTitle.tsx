export default function MainTitle(){
    return (
        <div style={{
            position: "absolute",
            left: '50%',
            top: '50%',
            zIndex: '-1',
            transform: 'translate(-50%, -50%)'
        }}>
            <img src="./logo-dark.png" style={{
                maxWidth: 200
            }}></img>
            <h1 style={{
                margin: 0
            }}>Whisper Web</h1>
        </div>
    )
}