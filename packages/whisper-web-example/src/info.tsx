export default function Info(){
    //returns package name with logo, and links
    return (
        <div style={{
            display: 'flex',
            flexFlow: 'column',
            gap: 10
        }}>
            <div style={{
                display: 'flex',
                gap: 10,
            }}>
                <img src="./mainlogo.png" style={{maxWidth: 30, alignSelf:'center'}}></img>
                <h2 style={{
                    margin:0
                }}>Whisper Web</h2>
            </div>
            <div style={{
                display: 'flex',
                gap: 10
            }}>
                <a href="https://github.com/remotion-dev/remotion/tree/main/packages/whisper-web-example">View Source Code</a>
                <a href="https://www.remotion.dev/docs/whisper-web/">Read Documentation</a>
            </div>
        </div>
    )
}