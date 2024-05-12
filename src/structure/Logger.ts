import chalk from 'chalk';

export class Logger {

    public static LogMessage(message: string, object?: any): void {
        const now = new Date();
        const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} / ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        console.log(chalk.blue(`[${formattedDateTime}]`) + ' ' + message + ' ' + chalk.hex('#FFA500')(object ?? "")) 
    }
    public static Error(message: string, object?: any): void {
        const now = new Date();
        const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} / ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        console.log(chalk.red(`[${formattedDateTime}]`) + ' ' + message + ' ' + chalk.hex('#FFA500')(object ?? "")) 
    }
}
