import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 180,
    height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 120,
                    background: 'linear-gradient(to bottom right, #f472b6, #db2777)', // Pink gradient
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '30px', // Apps usually have rounded corners
                }}
            >
                🧺
            </div>
        ),
        {
            ...size,
        }
    )
}
