package ces107.zesFin.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import ces107.zesFin.exception.ResourceNotFoundException;
import ces107.zesFin.model.FireProfile;
import ces107.zesFin.repository.FireProfileRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FireProfileService {

    private final FireProfileRepository repository;

    public List<FireProfile> findAll() {
        return repository.findAll();
    }

    public FireProfile findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FireProfile", id));
    }

    public FireProfile create(FireProfile profile) {
        calculateFireNumber(profile);
        return repository.save(profile);
    }

    public FireProfile update(Long id, FireProfile updated) {
        FireProfile existing = findById(id);
        existing.setCurrentAge(updated.getCurrentAge());
        existing.setCurrentSavings(updated.getCurrentSavings());
        existing.setMonthlyContribution(updated.getMonthlyContribution());
        existing.setMonthlyExpenses(updated.getMonthlyExpenses());
        existing.setExpectedReturnRate(updated.getExpectedReturnRate());
        existing.setInflationRate(updated.getInflationRate());
        existing.setSafeWithdrawalRate(updated.getSafeWithdrawalRate());
        existing.setTargetRetirementAge(updated.getTargetRetirementAge());
        calculateFireNumber(existing);
        return repository.save(existing);
    }

    private void calculateFireNumber(FireProfile profile) {
        BigDecimal annualExpenses = profile.getMonthlyExpenses().multiply(BigDecimal.valueOf(12));
        profile.setFireNumber(annualExpenses.divide(
                BigDecimal.valueOf(profile.getSafeWithdrawalRate()), 2, RoundingMode.HALF_UP));
    }
}
