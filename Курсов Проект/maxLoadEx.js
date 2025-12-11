/**
 * Решава задачата за натоварване (Unbounded Knapsack) чрез Динамично Програмиране по Етапи.
 * Логиката следва обратния ред на изчисление W_i = f(W_{i+1}), като в учебника.
 * * @param {number} capacity - Общият капацитет на кораба (Q).
 * @param {Array<Object>} items - Масив от обекти, описващи контейнерите.
 * Всеки обект трябва да има { type: номер на контейнера, weight: q_i, cost: c_i }.
 * @returns {Object} - Максималната стойност и всички оптимални решения.
 */
function solveKnapsackStageDP(capacity, items) {
  const Q = capacity;
  const N = items.length;

  // Сортираме елементите по тип в низходящ ред (4, 3, 2, 1), за да започнем от последната стъпка (i=N)
  const sortedItems = items.sort((a, b) => b.type - a.type);

  // W[i] ще съдържа { W: max_cost, x: optimal_x } за остатъчен капацитет S в стъпка i
  // W[4] -> резултат от стъпка 4, W[3] -> резултат от стъпка 3, и т.н.
  const W = [];

  // *******************************************************************
  // 1. ИТЕРАТИВНО ИЗЧИСЛЯВАНЕ ОТ i=N ДО i=2
  // W_i(S) = max_xi { c_i * x_i + W_{i+1}(S - q_i * x_i) }
  // *******************************************************************

  // Цикълът обхваща стъпки i=4, 3, 2
  for (let k = 0; k < N - 1; k++) {
    const currentItem = sortedItems[k];
    const currentStep = currentItem.type;

    // Индексът на следващата стъпка (i+1)
    const nextStepIndex = currentStep + 1;

    W[currentStep] = [];

    for (let S = 0; S <= Q; S++) {
      const max_x = Math.floor(S / currentItem.weight);
      let max_W = -1;
      let optimal_x = 0;

      for (let x = 0; x <= max_x; x++) {
        const remaining_S = S - currentItem.weight * x;

        // Ако nextStepIndex е 5 (за i=4), W[5] е 0 (базов случай)
        const W_next_step = W[nextStepIndex]
          ? W[nextStepIndex][remaining_S].W
          : 0;

        const current_W = currentItem.cost * x + W_next_step;

        if (current_W > max_W) {
          max_W = current_W;
          optimal_x = x;
        }
      }
      W[currentStep][S] = { W: max_W, x: optimal_x };
    }
  }

  // *******************************************************************
  // 2. ИЗЧИСЛЯВАНЕ НА ПЪРВА СТЪПКА (i=1) И НАМИРАНЕ НА ОПТИМАЛНОСТТА
  // *******************************************************************

  const firstItem = sortedItems[N - 1]; // item i=1
  const firstStep = firstItem.type;

  const max_x1 = Math.floor(Q / firstItem.weight);
  let max_W = -1;
  let optimal_x1_values = [];

  for (let x1 = 0; x1 <= max_x1; x1++) {
    const remaining_S = Q - firstItem.weight * x1;
    const W_next_step = W[firstStep + 1][remaining_S].W;
    const current_W = firstItem.cost * x1 + W_next_step;

    if (current_W > max_W) {
      max_W = current_W;
      optimal_x1_values = [x1];
    } else if (current_W === max_W) {
      optimal_x1_values.push(x1);
    }
  }

  // *******************************************************************
  // 3. ВЪЗСТАНОВЯВАНЕ НА ОПТИМАЛНИТЕ РЕШЕНИЯ (x_1* -> x_2* -> x_3* -> x_4*)
  // *******************************************************************

  const all_optimal_solutions = optimal_x1_values.map((x1) => {
    let solution = { [firstItem.type]: x1 };
    let current_S = Q;
    current_S = current_S - firstItem.weight * x1;

    // Обхождаме от стъпка 2 до N
    for (let k = N - 2; k >= 0; k--) {
      const currentItem = sortedItems[k];
      const currentStep = currentItem.type;

      // Намираме оптималното x_i* за W_i(current_S)
      const optimal_x = W[currentStep][current_S].x;

      solution[currentStep] = optimal_x;
      current_S = current_S - currentItem.weight * optimal_x;
    }

    // Преформатиране за ясен изход
    const finalSol = {};
    items.forEach((item) => {
      finalSol[`x${item.type}*`] = solution[item.type] || 0;
    });
    return finalSol;
  });

  return {
    max_cost: max_W,
    solutions: all_optimal_solutions,
    Q: Q,
    items: items,
  };
}

// ==========================================================
// ДАННИ ОТ ЗАДАЧАТА (Таблица 5)
// ==========================================================
const course_items = [
  { type: 1, weight: 2, cost: 4 },
  { type: 2, weight: 8, cost: 10 },
  { type: 3, weight: 3, cost: 6 },
  { type: 4, weight: 4, cost: 8 },
];

// **********************************************************
// ИЗПЪЛНЕНИЕ: Q = 10 тона
// **********************************************************
const USER_CAPACITY = 10;
const finalResult = solveKnapsackStageDP(USER_CAPACITY, course_items);

// --- Отпечатване на резултатите ---
console.log(
  "==================================================================="
);
console.log(`🚢 РЕЗУЛТАТ: Задача за Натоварване (Динамично Програмиране)`);
console.log(`Общ Капацитет (Q): ${finalResult.Q} тона`);
console.log(`МАСИВНИ ДАННИ: Тегло q_i / Стойност c_i `);
finalResult.items.forEach((i) =>
  console.log(`  Контейнер ${i.type}: ${i.weight}т / ${i.cost} ценови единици`)
);
console.log(
  "-------------------------------------------------------------------"
);
console.log(
  `✅ МАКСИМАЛНА СТОЙНОСТ НА ТОВАРА (W1(10)): ${finalResult.max_cost} ценови единици`
);
console.log(
  "-------------------------------------------------------------------"
);
console.log("ОПТИМАЛНИ РЕШЕНИЯ (x_i* - брой контейнери):");

finalResult.solutions.forEach((sol, index) => {
  // Изчисляване на общото тегло за проверка
  const totalWeight =
    sol["x1*"] * 2 + sol["x2*"] * 8 + sol["x3*"] * 3 + sol["x4*"] * 4;

  // Форматиране на изхода
  const solStr = Object.keys(sol)
    .map((key) => `${key.replace("*", "")}=${sol[key]}`)
    .join(", ");

  console.log(
    `  Решение ${index + 1}: ${solStr} (Общо тегло: ${totalWeight}т)`
  );
});
console.log(
  "==================================================================="
);
