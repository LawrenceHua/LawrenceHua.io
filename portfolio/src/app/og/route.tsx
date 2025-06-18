import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  try {
    const backgroundImage = await fetch(
      new URL('../../../public/BackgroundImageLogo.png', import.meta.url)
    ).then((res) => res.arrayBuffer())
    
    const profileImage = await fetch(
      new URL('../../../public/profile.jpg', import.meta.url)
    ).then((res) => res.arrayBuffer())

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: `url(data:image/png;base64,${Buffer.from(backgroundImage).toString('base64')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Overlay for better text readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
            }}
          />
          
          {/* Profile Picture */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              marginBottom: '20px',
            }}
          >
            <img
              src={profileImage as any}
              alt="Lawrence Hua"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid #3b82f6',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
            />
          </div>
          
          {/* Text Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              Lawrence Hua
            </h1>
            <p
              style={{
                fontSize: '24px',
                margin: '0 0 16px 0',
                color: '#e2e8f0',
                fontWeight: '500',
              }}
            >
              AI Product Manager
            </p>
            <div
              style={{
                fontSize: '20px',
                color: '#94a3b8',
                fontWeight: '400',
                padding: '12px 24px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              Learn more about Lawrence
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
} 