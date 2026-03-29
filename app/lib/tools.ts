export interface Tool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
    handler: (args: any) => Promise<string>;
}

// Инструмент 1: Погода
export const weatherTool: Tool = {
    name: 'get_weather',
    description: 'Получить текущую погоду в городе',
    parameters: {
        type: 'object',
        properties: {
            city: {
                type: 'string',
                description: 'Название города'
            }
        },
        required: ['city']
    },
    handler: async ({ city }) => {
        // Имитация API погоды
        const weathers: Record<string, string> = {
            'москва': '15°C, облачно',
            'спб': '12°C, дождь',
            'казань': '18°C, солнечно',
            'екатеринбург': '10°C, ветрено',
            'новосибирск': '5°C, снег'
        };

        const cityLower = city.toLowerCase();
        const weather = weathers[cityLower];

        if (weather) {
            return `Погода в ${city}: ${weather}`;
        }

        return `Извините, нет данных о погоде в ${city}`;
    }
};

// Инструмент 2: Калькулятор
export const calculatorTool: Tool = {
    name: 'calculate',
    description: 'Выполнить математические вычисления',
    parameters: {
        type: 'object',
        properties: {
            expression: {
                type: 'string',
                description: 'Математическое выражение (например, "2 + 2" или "15 * 3")'
            }
        },
        required: ['expression']
    },
    handler: async ({ expression }) => {
        try {
            // Безопасное вычисление (только для простых выражений)
            // В продакшене используйте math.js или подобное
            const result = Function('"use strict";return (' + expression + ')')();
            return `Результат: ${expression} = ${result}`;
        } catch (error) {
            return `Ошибка в выражении: ${expression}`;
        }
    }
};

// Инструмент 3: Время
export const timeTool: Tool = {
    name: 'get_time',
    description: 'Получить текущее время и дату',
    parameters: {
        type: 'object',
        properties: {
            format: {
                type: 'string',
                enum: ['full', 'time', 'date'],
                description: 'Формат времени'
            }
        }
    },
    handler: async ({ format = 'full' }) => {
        const now = new Date();

        switch(format) {
            case 'time':
                return `Текущее время: ${now.toLocaleTimeString('ru-RU')}`;
            case 'date':
                return `Текущая дата: ${now.toLocaleDateString('ru-RU')}`;
            default:
                return `Сейчас: ${now.toLocaleString('ru-RU')}`;
        }
    }
};

// Все доступные инструменты
export const tools: Tool[] = [
    weatherTool,
    calculatorTool,
    timeTool
];
