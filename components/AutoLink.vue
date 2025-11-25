<template>
    <span v-html="formattedText"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LinkifyIt from 'linkify-it';

interface Props {
    text: string;
    className?: string;
    target?: string;
}

const props = withDefaults(defineProps<Props>(), {
    className: 'text-morandi-primary hover:underline break-all',
    target: '_blank',
});

// 初始化 linkify-it
const linkify = new LinkifyIt();

// 转义 HTML 特殊字符，防止XSS
const escapeHtml = (text: string) => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/`/g, '&#96;');
};

// URL编码（用于href属性）
const escapeUrl = (url: string) => {
    // 对于已验证的安全URL，使用encodeURI而不是encodeURIComponent
    // encodeURI会保留URL结构字符（如：, /, ?, #)，只编码特殊字符
    try {
        return encodeURI(url);
    } catch (error) {
        // 如果编码失败，回退到HTML转义
        return escapeHtml(url);
    }
}

// 检查原始URL是否包含危险协议
const hasDangerousProtocol = (url: string): boolean => {
    const lowerUrl = url.toLowerCase().trim();
    const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:', 'about:'];
    return dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol));
}

// 验证URL协议是否安全
const isSafeUrl = (url: string): boolean => {
    try {
        const protocol = new URL(url).protocol.toLowerCase();
        // 只允许http、https和mailto协议
        return ['http:', 'https:', 'mailto:'].includes(protocol);
    } catch {
        // 如果URL解析失败，检查是否是相对路径或www开头的
        // 这些会被linkify-it识别，我们会在前面添加https://
        return !url.toLowerCase().startsWith('javascript:') &&
        !url.toLowerCase().startsWith('vbscript:') &&
        !url.toLowerCase().startsWith('data:') &&
        !url.toLowerCase().startsWith('file:') &&
        !url.toLowerCase().startsWith('about:')
    }
}

// 格式化文本，将URL转换为链接
const formattedText = computed(() => {
    const text = props.text || '';

    if (!text.trim()) {
        return '';
    }

    // 使用linkify-it匹配URL
    const matches = linkify.match(text);

    // 如果没有匹配到URL，直接返回转义后的文本
    if (!matches || matches.length === 0) {
        return escapeHtml(text);
    }

    // 构建格式化后的HTML
    let result = '';
    let lastIndex = 0;
    matches.forEach((match: { index: number, lastIndex: number, url: string, text: string }) => {
        // 转义匹配之前的文本
        result += escapeHtml(text.slice(lastIndex, match.index));

        // 先验证原始URL是否包含危险协议（防御性编程）
        const originalUrl = match.url;
        if (hasDangerousProtocol(originalUrl)) {
            // 如果原始URL包含危险协议，只显示转义后的文本，不创建链接
            result += escapeHtml(match.text);
        } else {
            // 原始URL安全，现在可以安全地添加协议
            let href = originalUrl;
            // 如果URL没有协议，添加https://
            if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
                href = `https://${href}`;
            }

            // 再次验证最终URL是否安全（双重检查）
            if (!isSafeUrl(href)) {
                // 如果最终URL不安全，只显示转义后的文本，不创建链接
                result += escapeHtml(match.text);
            } else {
                // 构建链接（href使用URL编码，其他属性使用HTML转义
                const escapeHref = escapeUrl(href);
                const linkText = escapeHtml(match.text);
                const escapedClassName = escapeHtml(props.className);
                const rel = props.target === '_blank' ? 'noopener noreferrer' : '';
                result += `<a href="${escapeHref}" target="${escapeHtml(props.target)}" ${rel ? `rel="${rel}"` : ''} class="${escapedClassName}">${linkText}</a>`;
            }
        }
        lastIndex = match.lastIndex;
    });
    // 添加剩余文本
    if (lastIndex < text.length) {
        result += escapeHtml(text.slice(lastIndex));
    }
    return result;
});
</script>