#!/usr/bin/env python3
"""
小红书搜索脚本 - 供 Node.js 后端调用

使用方法:
    python xhs_search.py <web_session> <keyword> [count]

输出:
    JSON 格式的搜索结果
"""

import asyncio
import sys
import json
import os

# 添加库路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(SCRIPT_DIR, 'scripts'))

from request.web.xhs_session import create_xhs_session


async def search_notes(web_session: str, keyword: str, count: int = 6) -> list:
    """搜索小红书笔记"""
    results = []
    
    try:
        xhs = await create_xhs_session(proxy=None, web_session=web_session)
        res = await xhs.apis.note.search_notes(keyword)
        data = await res.json()
        
        if data.get('success') and data.get('data'):
            items = data['data'].get('items', [])
            
            for item in items[:count]:
                note_card = item.get('note_card', {})
                interact = note_card.get('interact_info', {})
                user = note_card.get('user', {})
                cover = note_card.get('cover', {})
                
                # 尝试获取封面图
                cover_url = cover.get('url', '')
                if not cover_url:
                    # 尝试 info_list 中的图片
                    info_list = note_card.get('info_list', [])
                    if info_list:
                        for info in info_list:
                            if info.get('image_list'):
                                cover_url = info['image_list'][0].get('url', '')
                                break
                
                results.append({
                    'imageUrl': cover_url,
                    'thumbnailUrl': cover_url,
                    'source': '小红书',
                    'sourceIcon': '📕',
                    'author': user.get('nickname', '匿名'),
                    'authorId': user.get('user_id', ''),
                    'title': note_card.get('display_title', ''),
                    'likes': int(interact.get('liked_count', 0)),
                    'noteId': item.get('id', ''),
                    'xsecToken': item.get('xsec_token', ''),
                    'link': f"https://www.xiaohongshu.com/explore/{item.get('id', '')}"
                })
        
        await xhs.close_session()
        
    except Exception as e:
        return {'error': str(e), 'results': []}
    
    return results


def main():
    if len(sys.argv) < 3:
        print(json.dumps({'error': '用法: python xhs_search.py <web_session> <keyword> [count]'}))
        sys.exit(1)
    
    web_session = sys.argv[1]
    keyword = sys.argv[2]
    count = int(sys.argv[3]) if len(sys.argv) > 3 else 6
    
    results = asyncio.run(search_notes(web_session, keyword, count))
    print(json.dumps(results, ensure_ascii=False))


if __name__ == '__main__':
    main()