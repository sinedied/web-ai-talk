// AI Features implementation

async function proofRead(text) {
  if ("Proofreader" in self) {
    const proofReader = await Proofreader.create({
      expectedInputLanguages: ["en"],
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      },
    });

    const proofreadResult = await proofReader.proofread(text);
    console.log(proofreadResult);

    return proofreadResult.correctedInput;
  }
}

async function summarize(data) {
  if ('Summarizer' in self) {
    const summarizer = await Summarizer.create({
      type: "key-points",
      expectedInputLanguages: ["en"],
      outputLanguage: "en",
      expectedContextLanguages: ["en"],
      sharedContext: "These are review for an article give as a stringify json. Give me a sumarry of what people think",
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      }
    })

    const response = await summarizer.summarize(JSON.stringify(data));

    return response;
  }
}

async function analyseImage(image) {
  const session = await LanguageModel.create({
    expectedInputs: [{ type: "image" }],
  });

  const prompt = `
  This is the image of a product. Generate a description for a review mentioning its condition.
  in one sentence only, tell how you felt when you received this product.
  
  Then, also generate a title for the review.
  Only output a JSON object {title, review}
  `;

  const schema = {
    title: "string",
    description: "string",
  };

  const response = await session.prompt(
    [
      {
        role: "user",
        content: [
          { type: "text", value: prompt },
          { type: "image", value: image },
        ],
      },
   ],
   {
     responseConstraint: schema,
   }
  );
  console.log(response);
  return JSON.parse(response);
}
