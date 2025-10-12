import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import './Layout.css';

/**
 * 전체 레이아웃 컴포넌트
 * 사이드바와 메인 콘텐츠 영역을 포함
 */
function Layout() {
    return (
        <div className="uk-offcanvas-content">
            {/* 헤더 영역 */}
            <header className="app-header">
                <div className="header-container">
                    {/* 왼쪽 영역: 메뉴 버튼 + 타이틀 */}
                    <div className="header-left">
                        {/* 사이드바 토글 버튼 */}
                        <Sidebar />

                        {/* 페이지 타이틀 */}
                        <h1 className="page-title">
                            🌸 계산기 모음
                        </h1>
                    </div>

                    {/* 오른쪽 영역: 추가 버튼들 (필요시 사용) */}
                    <div className="header-right">
                        {/* 여기에 검색, 설정 등 추가 버튼 배치 가능 */}
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 영역 */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* 푸터 영역 */}
            <footer className="app-footer">
                <div className="uk-container uk-container-large uk-text-center">
                    <p className="uk-text-small">
                        © 2024 계산기 모음. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Layout;
