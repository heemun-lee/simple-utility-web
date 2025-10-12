import LinkCard from '../components/LinkCard.jsx'

function Home() {
    const pages = [
        {
            id: 1,
            title: '게이지 변환 계산기',
            description: '패턴 게이지와 실제 게이지를 비교하여 정확한 코/단 수를 계산합니다',
            path: '/knitting/converter/gauge',
            category: '뜨개질'
        },
        {
            id: 2,
            title: '코 증감 계산기',
            description: '목표 코 수에 도달하기 위한 코 늘림/줄임 패턴을 자동으로 계산합니다',
            path: '/knitting/converter/stitch',
            category: '뜨개질'
        }
    ]
    return (
        <div className="uk-section uk-section-muted" style={{minHeight: '100vh'}}>
            <div className="uk-container">
                {/* 헤더 */}
                <div className="uk-margin-large-bottom">
                    <h1 className="uk-heading-large uk-margin-remove-bottom">계산기 모음</h1>
                    <p className="uk-text-lead uk-text-muted uk-margin-small-top">
                        필요한 계산기를 선택하세요
                    </p>
                </div>

                {/* 계산기 그리드 */}
                <div className="uk-grid uk-grid-match uk-child-width-1-1 uk-child-width-1-2@s" data-uk-grid>
                    {pages.map(page => (
                        <div className="uk-grid-margin" key={page.id}>
                            <LinkCard
                                title={page.title}
                                description={page.description}
                                path={page.path}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Home