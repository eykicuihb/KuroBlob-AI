import { ExpressionGenerator } from './js/expression-generator.js';

(async () => {
  console.log('🧪 Testing Prompt Diversity & Distinct Accessory Code Generation...');

  const generator = new ExpressionGenerator(null); // testing dynamic procedural compiler fallback

  const prompt1 = '戴着白墨镜的，汽车摩托车的送外卖员';
  const prompt2 = '山姆大叔开着车';

  console.log(`\n1. Generating: "${prompt1}"...`);
  const exp1 = await generator.generate(prompt1);
  console.log('   - NameZh:', exp1.nameZh);
  console.log('   - Emoji:', exp1.emoji);
  console.log('   - Code preview:\n', exp1.code.slice(0, 300));

  console.log(`\n2. Generating: "${prompt2}"...`);
  const exp2 = await generator.generate(prompt2);
  console.log('   - NameZh:', exp2.nameZh);
  console.log('   - Emoji:', exp2.emoji);
  console.log('   - Code preview:\n', exp2.code.slice(0, 300));

  // Assertions
  if (exp1.code === exp2.code) {
    throw new Error('❌ FAIL: Both prompts generated identical code!');
  }

  if (!exp1.code.includes('Delivery Rider Safety Helmet') && !exp1.code.includes('Trendy White Frame Sunglasses')) {
    throw new Error('❌ FAIL: Prompt 1 does not contain expected delivery or white sunglasses vector steps!');
  }

  if (!exp1.code.includes('Motorcycle Handlebars')) {
    throw new Error('❌ FAIL: Prompt 1 does not contain expected motorcycle handlebars vector steps!');
  }

  if (!exp2.code.includes('Uncle Sam Patriotic Top Hat')) {
    throw new Error('❌ FAIL: Prompt 2 does not contain Uncle Sam top hat!');
  }

  if (!exp2.code.includes('Driving Sports Steering Wheel')) {
    throw new Error('❌ FAIL: Prompt 2 does not contain driving steering wheel!');
  }

  console.log('\n🎉 SUCCESS: Both prompts generate completely distinct, richly layered procedural expressions!');
})();
