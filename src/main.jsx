import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

// UIKit CSS를 먼저 import (기본 스타일)
import 'uikit/dist/css/uikit.min.css'
import UIkit from 'uikit'
import Icons from 'uikit/dist/js/uikit-icons'

// 커스텀 CSS를 나중에 import (override)
import './index.css'
import App from './App.jsx'

// UIKit 아이콘 로드
UIkit.use(Icons)

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)
