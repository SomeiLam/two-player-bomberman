import React from 'react'

const PlayerHelmet = ({ player }: { player: string }) => {
  const helmentColor = player === '1' ? '#8b3e6c' : '#32589b'
  const circleColor = player === '1' ? '#ff66c4' : '#5271ff'
  return (
    <svg
      // Removed zoomAndPan, version, etc. which are typically unused in React
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 375 374.999991"
      width="500"
      height="500"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <clipPath id="93a706998f">
          <path
            d="M 21 0 L 353.507812 0 L 353.507812 331.214844 L 21 331.214844 Z M 21 0 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="b384c24529">
          <path
            d="M 353.507812 223.851562 C 353.507812 283.144531 279.179688 331.214844 187.496094 331.214844 C 95.808594 331.214844 21.480469 283.144531 21.480469 223.851562 L 21.480469 107.359375 C 21.480469 48.0625 95.808594 -0.00390625 187.496094 -0.00390625 C 279.179688 -0.00390625 353.507812 48.0625 353.507812 107.359375 Z M 353.507812 223.851562 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="2b830272ae">
          <path
            d="M 61.625 0 L 313.71875 0 L 313.71875 91.933594 L 61.625 91.933594 Z M 61.625 0 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="d56e008d81">
          <path
            d="M 187.5 0 C 117.980469 0 61.625 20.578125 61.625 45.964844 C 61.625 71.351562 117.980469 91.933594 187.5 91.933594 C 257.019531 91.933594 313.375 71.351562 313.375 45.964844 C 313.375 20.578125 257.019531 0 187.5 0 Z M 187.5 0 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="0464ef26aa">
          <path
            d="M 103 9 L 149 9 L 149 44 L 103 44 Z M 103 9 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="734dbd62dc">
          <path
            d="M 151.058594 39.214844 L 109.074219 46.671875 L 103.726562 16.566406 L 145.710938 9.109375 Z M 151.058594 39.214844 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="ee59dcc1d4">
          <path
            d="M 136.941406 40.992188 C 134.871094 41.800781 132.46875 42.515625 130.070312 42.941406 C 127.667969 43.367188 125.316406 43.539062 123.113281 43.492188 C 123.066406 43.484375 123.019531 43.492188 122.972656 43.488281 C 114.675781 43.203125 107.988281 39.742188 106.941406 34.5 L 103.753906 16.558594 L 145.710938 9.109375 L 148.894531 27.03125 C 149.722656 32.359375 144.726562 37.890625 136.941406 40.992188 Z M 136.941406 40.992188 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="52b95dbae4">
          <path
            d="M 219 9 L 265 9 L 265 44 L 219 44 Z M 219 9 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="3098dc0d93">
          <path
            d="M 259.71875 46.667969 L 217.695312 39.433594 L 222.882812 9.296875 L 264.90625 16.53125 Z M 259.71875 46.667969 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="e9c1202ea7">
          <path
            d="M 245.835938 43.546875 C 243.617188 43.605469 241.113281 43.464844 238.710938 43.050781 C 236.308594 42.636719 234.039062 42 231.980469 41.207031 C 231.9375 41.183594 231.894531 41.175781 231.851562 41.15625 C 224.144531 38.070312 219.027344 32.546875 219.820312 27.257812 L 222.910156 9.304688 L 264.90625 16.53125 L 261.816406 34.472656 C 260.789062 39.761719 254.214844 43.273438 245.835938 43.546875 Z M 245.835938 43.546875 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="9dd9af79df">
          <path
            d="M 146.363281 290.082031 L 228.636719 290.082031 L 228.636719 372.355469 L 146.363281 372.355469 Z M 146.363281 290.082031 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="8d9422b9a3">
          <path
            d="M 187.5 290.082031 C 164.78125 290.082031 146.363281 308.5 146.363281 331.21875 C 146.363281 353.9375 164.78125 372.355469 187.5 372.355469 C 210.21875 372.355469 228.636719 353.9375 228.636719 331.21875 C 228.636719 308.5 210.21875 290.082031 187.5 290.082031 Z M 187.5 290.082031 "
            clipRule="nonzero"
          />
        </clipPath>
      </defs>

      <g clipPath="url(#93a706998f)">
        <g clipPath="url(#b384c24529)">
          <path
            fill={helmentColor}
            d="M 353.507812 -0.00390625 L 353.507812 331.214844 L 20.996094 331.214844 L 20.996094 -0.00390625 Z M 353.507812 -0.00390625 "
            fillOpacity="1"
            fillRule="nonzero"
          />
        </g>
      </g>
      <g clipPath="url(#2b830272ae)">
        <g clipPath="url(#d56e008d81)">
          <path
            fill="#ff914d"
            d="M 61.625 0 L 313.359375 0 L 313.359375 91.933594 L 61.625 91.933594 Z M 61.625 0 "
            fillOpacity="1"
            fillRule="nonzero"
          />
        </g>
      </g>
      <g clipPath="url(#0464ef26aa)">
        <g clipPath="url(#734dbd62dc)">
          <g clipPath="url(#ee59dcc1d4)">
            <path
              fill="#000000"
              d="M 151.058594 39.214844 L 109.074219 46.671875 L 103.726562 16.566406 L 145.710938 9.109375 Z M 151.058594 39.214844 "
              fillOpacity="1"
              fillRule="nonzero"
            />
          </g>
        </g>
      </g>
      <g clipPath="url(#52b95dbae4)">
        <g clipPath="url(#3098dc0d93)">
          <g clipPath="url(#e9c1202ea7)">
            <path
              fill="#000000"
              d="M 259.71875 46.667969 L 217.695312 39.433594 L 222.882812 9.296875 L 264.90625 16.53125 Z M 259.71875 46.667969 "
              fillOpacity="1"
              fillRule="nonzero"
            />
          </g>
        </g>
      </g>
      <g clipPath="url(#9dd9af79df)">
        <g clipPath="url(#8d9422b9a3)">
          <path
            fill={circleColor}
            d="M 146.363281 290.082031 L 228.636719 290.082031 L 228.636719 372.355469 L 146.363281 372.355469 Z M 146.363281 290.082031 "
            fillOpacity="1"
            fillRule="nonzero"
          />
        </g>
      </g>
    </svg>
  )
}

export default PlayerHelmet
