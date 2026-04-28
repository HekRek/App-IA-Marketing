
import { GoogleGenAI, Type } from "@google/genai";
import { ICP, AuditResult, MarketingCampaign, OwnerProfile, Competitor } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const geminiService = {
  async conductAudit(profile: OwnerProfile, competitors: Competitor[]): Promise<AuditResult> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Realiza un análisis de competencia e identifica mejoras estratégicas para el siguiente negocio:
      Negocio: ${profile.name} (${profile.companyUrl}) - Sector: ${profile.sector} - Ubicación: ${profile.location}
      
      Competidores actuales:
      ${competitors.map(c => `- ${c.name} (${c.website}): ${c.valueProposition}. Fortalezas: ${c.strengths.join(', ')}. Debilidades: ${c.weaknesses.join(', ')}`).join('\n')}
      
      Compara el negocio con su competencia y genera una lista de exactamente 5 mejoras críticas y accionables. Responde en ESPAÑOL.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["improvements"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || "{}");
      return { 
        improvements: data.improvements || [], 
        lastUpdate: new Date().toISOString() 
      };
    } catch {
      return { improvements: [], lastUpdate: "" };
    }
  },

  async generateICP(ownerSector: string, ownerCompany: string): Promise<ICP> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Define the Ideal Customer Profile (ICP) for ${ownerCompany} in the ${ownerSector} sector. Responde en ESPAÑOL.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sector: { type: Type.STRING },
            companySize: { type: Type.STRING },
            location: { type: Type.STRING },
            problemSolved: { type: Type.STRING },
            budgetRange: { type: Type.STRING },
            preferredChannel: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: ['Alta', 'Media', 'Baja'] }
          },
          required: ["sector", "companySize", "location", "problemSolved", "budgetRange", "preferredChannel", "urgency"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || "{}");
      return { ...data, marketingIdeas: [] };
    } catch {
      return { 
        sector: "", 
        companySize: "", 
        location: "", 
        problemSolved: "", 
        budgetRange: "", 
        preferredChannel: "", 
        urgency: "Media",
        marketingIdeas: []
      };
    }
  },

  async generateMarketingPack(businessName: string, productDescription: string): Promise<MarketingCampaign> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a marketing pack for "${businessName}". Product: ${productDescription}. 
      Include slogan, campaign ideas, a newsletter draft, a flyer description, and a banner generation prompt.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            slogan: { type: Type.STRING },
            ideas: { type: Type.ARRAY, items: { type: Type.STRING } },
            newsletter: { type: Type.STRING },
            flyer: { type: Type.STRING },
            bannerPrompt: { type: Type.STRING }
          },
          required: ["id", "title", "slogan", "ideas", "newsletter", "flyer", "bannerPrompt"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || "{}");
      return { 
        ...data, 
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'Campaign',
        newsletter: {
          subject: "Check out our latest news",
          intro: "We have some exciting updates for you.",
          body: data.newsletter || "",
          cta: "Learn more"
        }
      };
    } catch {
      return { 
        id: Date.now().toString(), 
        timestamp: new Date().toISOString(),
        type: 'Campaign',
        title: "", 
        slogan: "", 
        ideas: [], 
        newsletter: { subject: "", intro: "", body: "", cta: "" }, 
        flyer: "", 
        banner: { title: "", subtitle: "", ctaButton: "" } 
      };
    }
  },

  async generateImage(prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1"): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  }
};
