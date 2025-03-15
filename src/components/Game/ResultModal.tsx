import React from 'react'

interface ResultModalProps {
  result: string
  onClose: () => void
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Game Over</h2>
        <p className="text-xl mb-6">{result}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default ResultModal
