from ai.classifier import classify_fir

sample_fir = "Ramesh was caught trying to steal a bicycle near MG Road, Bangalore."
print("Sample FIR:", sample_fir)
print("Classification:", classify_fir(sample_fir))

sample_fir_2 = "A fraudulent email was sent to Rahul asking for money and his credit card details were hacked online."
print("Sample FIR 2:", sample_fir_2)
print("Classification:", classify_fir(sample_fir_2))
