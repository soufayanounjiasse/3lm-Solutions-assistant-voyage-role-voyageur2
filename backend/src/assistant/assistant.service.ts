import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatMessageDto } from './dto/chat-message.dto';

const SYSTEM_PROMPT = `Tu es l'assistant de voyage de l'application Voya. Tu aides les voyageurs avant, pendant et après leur voyage : recommandations, itinéraires, informations pratiques, guidage pas-à-pas.
Réponds de façon concise et utile, dans la langue du message de l'utilisateur.
Quand c'est pertinent, propose une action concrète à la fin de ta réponse (ex: "Veux-tu que je te trouve un chauffeur ?").`;

@Injectable()
export class AssistantService {
  constructor(private readonly config: ConfigService) {}

  async chat(dto: ChatMessageDto): Promise<{ reply: string }> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        "Assistant indisponible : clé API non configurée côté serveur.",
      );
    }

    // Gemini utilise "model"/"user" au lieu de "assistant"/"user", et un format de contenu différent.
    const contents = [
      ...(dto.history ?? []).map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: dto.message }] },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        }),
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      throw new InternalServerErrorException(
        `Erreur de l'assistant IA : ${res.status} ${errBody}`,
      );
    }

    const data = await res.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Désolé, je n'ai pas pu générer de réponse.";
    return { reply };
  }
}