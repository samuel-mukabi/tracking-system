'use client'

import dynamic from 'next/dynamic'

const DriverMap = dynamic(() => import('./components/DriverMap'), { ssr: false })

export default function Page() {
    return (
        <main>
            <DriverMap />
        </main>
    )
}
