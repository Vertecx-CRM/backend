import { Quotes } from 'src/quotes/entities/quotes.entity';
export declare class Appointments {
    appointmentdate: string;
    quotesid: number;
    technicalid: number;
    appointmentid: number;
    photo: string;
    observation: string;
    video: string;
    quotes: Quotes;
}
